"""农智汇 - 开源涉农知识聚合平台 (Flask Web版)
数据全部来自 Node.js 后端 (server/)，Flask 仅作为 Web 前端层。
启动前请先启动 Node 后端: cd server && node app.js
"""
import time
import hashlib
import requests
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

import html as html_lib
import os
import re

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'nongzhihui-secret-2026')

# Node.js 后端地址（部署时通过环境变量 API_BASE 设置）
API_BASE = os.environ.get('API_BASE', 'http://localhost:3000')
# 模块加载时自动检测：若未设置 API_BASE 且本地 3000 端口不通，自动切换到 Render 后端
# 注意：必须在模块级别执行，gunicorn 不会走 __main__ 块
if API_BASE == 'http://localhost:3000':
    import socket as _socket
    try:
        _s = _socket.create_connection(('localhost', 3000), timeout=2)
        _s.close()
    except Exception:
        API_BASE = 'https://nongzhihui-api.onrender.com'
        print(f'[启动] 本地后端不可达，自动切换到 Render 后端: {API_BASE}')

# ============ 数据清洗 ============
# 网页爬取数据中常见的垃圾文本
JUNK_PATTERNS = [
    r'播报\s*[□■]?\s*暂停',
    r'播报',
    r'暂停',
    r'收听',
    r'朗读',
    r'语音播报',
    r'百度首页',
    r'登录',
    r'注册',
    r'反馈',
    r'分享',
    r'复制链接',
    r'新浪微博',
    r'QQ空间',
    r'举报',
    r'下载客户端',
    r'网页\s*资讯\s*视频\s*图片\s*知道\s*文库',
]
JUNK_RE = re.compile('|'.join(JUNK_PATTERNS), re.IGNORECASE)

def clean_text(text):
    """清洗爬取数据中的垃圾文本和未解码的 HTML 实体"""
    if not text or not isinstance(text, str):
        return text or ''
    # 解码 HTML 实体 (&ensp; &#0183; 等)
    text = html_lib.unescape(text)
    # 去掉垃圾文本
    text = JUNK_RE.sub('', text)
    # 去掉标题中的网址（如 "baidu.comhttps://baike.baidu.com › item › 农业"）
    # 匹配 "域名https://..." 或 "域名http://..." 开头的模式（含后面的面包屑路径）
    text = re.sub(r'^[\w.-]+https?://[\w./-]+(?:\s*[›>]\s*[\w.%-]+)*\s*[›>]?\s*', '', text)
    # 匹配纯 URL 开头
    text = re.sub(r'^https?://[\w./-]+(?:\s*[›>]\s*[\w.%-]+)*\s*[›>]?\s*', '', text)
    # 匹配 "xxx.com › path › path" 格式的面包屑网址
    text = re.sub(r'^[\w.-]+\.(?:com|cn|org|net|gov)(?:\.cn)?(?:\s*[›>]\s*[\w.%-]+)+\s*', '', text)
    # 清理开头残留的 "> xxx" 面包屑
    text = re.sub(r'^(?:\s*[›>]\s*[\w.%-]*)+\s*', '', text)
    # 清理多余空白
    text = re.sub(r'\s{2,}', ' ', text).strip()
    return text

def clean_resource(r):
    """清洗单个资源对象"""
    if not r or not isinstance(r, dict):
        return r
    r = dict(r)  # 不修改原对象
    if 'title' in r:
        r['title'] = clean_text(r['title'])
        # 如果标题清洗后为空，用 source 或 summary 前30字做回退
        if not r['title']:
            r['title'] = r.get('source', '') or (r.get('summary', '')[:30] + '...' if r.get('summary') else '未知资源')
    if 'summary' in r:
        r['summary'] = clean_text(r['summary'])
    if 'content' in r:
        r['content'] = html_lib.unescape(r.get('content', ''))
    return r

def clean_list(items):
    """清洗资源列表"""
    cleaned = [clean_resource(r) for r in items if r]
    # 缓存到 Flask 侧，方便详情页查找
    for r in cleaned:
        rid = r.get('_id')
        if rid:
            resource_cache[str(rid)] = r
    return cleaned

# ============ 常量 ============
CATEGORIES = {
    'law': {'name': '法律法规', 'emoji': '⚖️'},
    'policy': {'name': '政策文件', 'emoji': '📋'},
    'tech': {'name': '农技手册', 'emoji': '🌾'},
    'culture': {'name': '乡土文献', 'emoji': '📖'},
}

HOT_KEYWORDS = [
    '农村土地承包法', '乡村振兴政策', '农业补贴',
    '种植技术', '农产品质量安全', '农民专业合作社',
]

# ============ 内存存储（用户相关，Flask 自管） ============
collect_store = {}   # userId -> [{ resourceId, createdAt }]
history_store = {}   # userId -> [{ resourceId, title, summary, category, viewTime }]
feedback_store = []
resource_cache = {}  # _id -> resource dict (Flask 侧缓存，解决后端缓存未命中问题)

# ============ 后端 API 调用 ============
def api_get(path, params=None, timeout=60):
    """调用 Node 后端 GET 接口（Render 免费实例唤醒需要 50s+）"""
    try:
        print(f'[API] GET {API_BASE}{path}')
        r = requests.get(f'{API_BASE}{path}', params=params, timeout=timeout)
        print(f'[API] GET {path} -> {r.status_code}')
        return r.json()
    except Exception as e:
        print(f'[API] GET {path} 失败: {e}')
        return {'code': -1, 'data': [], 'message': str(e)}

def api_post(path, data=None, timeout=60):
    """调用 Node 后端 POST 接口"""
    try:
        r = requests.post(f'{API_BASE}{path}', json=data, timeout=timeout)
        return r.json()
    except Exception as e:
        print(f'[API] POST {path} 失败: {e}')
        return {'code': -1, 'message': str(e)}

def extract_list(resp, key='data'):
    """从后端响应中提取列表数据"""
    if not resp or resp.get('code') != 0:
        return []
    data = resp.get(key, resp.get('data', []))
    if isinstance(data, dict):
        return data.get('list', [])
    if isinstance(data, list):
        return data
    return []

# ============ 辅助函数 ============
def get_user_id():
    return session.get('user_id', None)

def require_login(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not get_user_id():
            if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify(code=-1, message='请先登录'), 401
            return redirect(url_for('my'))
        return f(*args, **kwargs)
    return decorated

def category_name(cat):
    return CATEGORIES.get(cat, {}).get('name', cat)

# ============ 页面路由 ============
@app.route('/')
def index():
    # 从 Node 后端获取热门资源和最新政策
    hot_resp = api_get('/api/resources/hot')
    hot = clean_list(extract_list(hot_resp))
    latest_resp = api_get('/api/resources/latest', {'category': 'policy'})
    latest = clean_list(extract_list(latest_resp))
    return render_template('index.html',
                           hot_resources=hot[:6],
                           latest_policies=latest[:6],
                           categories=CATEGORIES,
                           category_name=category_name)

@app.route('/search')
def search_page():
    return render_template('search.html', hot_keywords=HOT_KEYWORDS)

@app.route('/category')
@app.route('/category/<cat>')
def category_page(cat='law'):
    resp = api_get('/api/resources', {'category': cat, 'page': 1, 'pageSize': 20})
    resources = clean_list(extract_list(resp))
    return render_template('category.html',
                           categories=CATEGORIES,
                           current=cat,
                           resources=resources,
                           category_name=category_name)

@app.route('/detail/<resource_id>')
def detail_page(resource_id):
    # 先尝试从 Node 后端获取
    resp = api_get(f'/api/resources/{resource_id}')
    resource = resp.get('data') if resp.get('code') == 0 else None
    if resource:
        resource = clean_resource(resource)
        resource_cache[str(resource_id)] = resource
    else:
        # 后端缓存未命中，从 Flask 本地缓存取
        resource = resource_cache.get(str(resource_id))
    if not resource:
        return render_template('404.html'), 404
    # 记录浏览历史
    uid = get_user_id()
    if uid:
        if uid not in history_store:
            history_store[uid] = []
        hist = history_store[uid]
        hist = [h for h in hist if h['resourceId'] != resource_id]
        hist.insert(0, {
            'resourceId': resource_id,
            'title': resource.get('title', ''),
            'summary': resource.get('summary', ''),
            'category': resource.get('category', ''),
            'viewTime': datetime.now().strftime('%Y-%m-%d %H:%M')
        })
        history_store[uid] = hist[:100]
        # 也通知 Node 后端
        api_post('/api/history/add', {'userId': uid, 'resourceId': resource_id})
    # 收藏状态
    is_collected = False
    if uid and uid in collect_store:
        is_collected = any(c['resourceId'] == resource_id for c in collect_store[uid])
    # 相关资源
    related_resp = api_get(f'/api/resources/{resource_id}/related')
    related = clean_list(extract_list(related_resp))
    return render_template('detail.html',
                           resource=resource,
                           is_collected=is_collected,
                           related=related[:4],
                           category_name=category_name)

@app.route('/my')
def my():
    return render_template('my.html', user_id=get_user_id())

@app.route('/collect')
@require_login
def collect_page():
    uid = get_user_id()
    user_collects = collect_store.get(uid, [])
    # 尝试从 Node 后端获取收藏列表
    resp = api_get('/api/collect/list', {'userId': uid})
    items = clean_list(extract_list(resp))
    if not items:
        # 回退到本地存储
        items = []
        for c in user_collects:
            r_resp = api_get(f'/api/resources/{c["resourceId"]}')
            r = r_resp.get('data') if r_resp.get('code') == 0 else None
            if r:
                items.append({**r, 'collectTime': c['createdAt']})
    return render_template('collect.html', items=items, category_name=category_name)

@app.route('/history')
@require_login
def history_page():
    uid = get_user_id()
    # 优先用本地记录（有标题等信息）
    items = history_store.get(uid, [])
    if not items:
        resp = api_get('/api/history/list', {'userId': uid, 'page': 1, 'pageSize': 50})
        items = extract_list(resp)
    return render_template('history.html', items=items, category_name=category_name)

@app.route('/feedback')
@require_login
def feedback_page():
    return render_template('feedback.html')

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/chat')
def chat_page():
    return render_template('chat.html')

# ============ API 路由（代理到 Node 后端） ============
@app.route('/api/search')
def api_search():
    keyword = request.args.get('keyword', '').strip()
    cat = request.args.get('category', '')
    sort_by = request.args.get('sortBy', 'relevance')
    categories = request.args.get('categories', '')
    sources = request.args.get('sources', '')
    regions = request.args.get('regions', '')
    crop_types = request.args.get('cropTypes', '')
    year_min = request.args.get('yearMin', '')
    year_max = request.args.get('yearMax', '')
    if not keyword:
        return jsonify(code=0, data={'list': [], 'total': 0})
    params = {'keyword': keyword, 'sortBy': sort_by, 'page': 1, 'pageSize': 20}
    if cat:
        params['category'] = cat
    if categories:
        params['categories'] = categories
    if sources:
        params['sources'] = sources
    if regions:
        params['regions'] = regions
    if crop_types:
        params['cropTypes'] = crop_types
    if year_min:
        params['yearMin'] = year_min
    if year_max:
        params['yearMax'] = year_max
    resp = api_get('/api/search', params)
    if resp.get('code') == 0:
        data = resp.get('data', {})
        if isinstance(data, dict) and 'list' in data:
            data['list'] = clean_list(data['list'])
            resp['data'] = data
        return jsonify(resp)
    return jsonify(code=0, data={'list': [], 'total': 0})

@app.route('/api/suggestions')
def api_suggestions():
    prefix = request.args.get('prefix', '').strip()
    if not prefix:
        return jsonify(code=0, data=[])
    resp = api_get('/api/search/suggestions', {'prefix': prefix})
    return jsonify(resp if resp.get('code') == 0 else {'code': 0, 'data': []})

@app.route('/api/fetch-content')
def api_fetch_content():
    url = request.args.get('url', '').strip()
    if not url:
        return jsonify(code=-1, data={'content': ''})
    resp = api_get('/api/resources/fetch-content', {'url': url}, timeout=15)
    return jsonify(resp if resp.get('code') == 0 else {'code': -1, 'data': {'content': ''}})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    nickname = data.get('nickname', '').strip()
    if not nickname:
        return jsonify(code=-1, message='请输入昵称')
    uid = 'user_' + hashlib.md5(nickname.encode()).hexdigest()[:8]
    session['user_id'] = uid
    session['nickname'] = nickname
    return jsonify(code=0, message='登录成功', data={'userId': uid, 'nickname': nickname})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify(code=0, message='已退出')

@app.route('/api/collect/toggle', methods=['POST'])
@require_login
def api_collect_toggle():
    uid = get_user_id()
    data = request.get_json() or {}
    rid = data.get('resourceId', '')
    if not rid:
        return jsonify(code=-1, message='参数不完整')
    # 本地记录
    if uid not in collect_store:
        collect_store[uid] = []
    lst = collect_store[uid]
    idx = next((i for i, c in enumerate(lst) if c['resourceId'] == rid), -1)
    if idx != -1:
        lst.pop(idx)
        is_collected = False
        msg = '已取消收藏'
    else:
        lst.insert(0, {'resourceId': rid, 'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M')})
        is_collected = True
        msg = '收藏成功'
    # 同步到 Node 后端
    api_post('/api/collect/toggle', {'userId': uid, 'resourceId': rid})
    return jsonify(code=0, data={'isCollected': is_collected}, message=msg)

@app.route('/api/feedback', methods=['POST'])
@require_login
def api_feedback():
    uid = get_user_id()
    data = request.get_json() or {}
    content = data.get('content', '').strip()
    contact = data.get('contact', '').strip()
    if not content:
        return jsonify(code=-1, message='请输入反馈内容')
    # 同步到 Node 后端
    api_post('/api/feedback/add', {'userId': uid, 'content': content, 'contact': contact})
    return jsonify(code=0, message='提交成功，感谢反馈')

@app.route('/api/history/clear', methods=['POST'])
@require_login
def api_history_clear():
    uid = get_user_id()
    history_store[uid] = []
    api_post('/api/history/clear', {'userId': uid})  # 也通知后端
    return jsonify(code=0, message='已清空')

@app.route('/api/chat/send', methods=['POST'])
def api_chat_send():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    session_id = data.get('sessionId', '')
    if not message:
        return jsonify(code=-1, message='请输入消息')
    resp = api_post('/api/chat/send', {'message': message, 'sessionId': session_id}, timeout=90)
    return jsonify(resp)

@app.route('/api/chat/clear', methods=['POST'])
def api_chat_clear():
    data = request.get_json() or {}
    session_id = data.get('sessionId', '')
    resp = api_post('/api/chat/clear', {'sessionId': session_id})
    return jsonify(resp)

# ============ 模板过滤器 ============
@app.template_filter('cat_name')
def cat_name_filter(cat):
    return category_name(cat)

@app.context_processor
def inject_globals():
    return {
        'current_user': get_user_id(),
        'current_nickname': session.get('nickname', ''),
        'now_year': 2026
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # 本地开发时如果没有设置 API_BASE，自动使用 Render 后端
    if API_BASE == 'http://localhost:3000':
        import socket
        try:
            s = socket.create_connection(('localhost', 3000), timeout=2)
            s.close()
        except:
            API_BASE = 'https://nongzhihui-api.onrender.com'
            print(f'本地后端未启动，自动切换到 Render 后端: {API_BASE}')
    print(f'Flask Web 前端启动，后端地址: {API_BASE}')
    app.run(debug=True, host='0.0.0.0', port=port)
