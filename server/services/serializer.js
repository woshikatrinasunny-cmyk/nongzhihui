/**
 * Resource 序列化/反序列化服务
 * 确保 Resource 对象在 JSON 传输中所有字段完整保留
 */

const RESOURCE_FIELDS = [
  '_id', 'title', 'summary', 'category', 'publishTime',
  'source', 'sourceUrl', 'tags', 'authority', 'platform',
  'platformName', 'region', 'cropType', 'viewCount', 'collectCount'
];

/**
 * 将 Resource 对象序列化为 JSON 字符串
 * @param {object} resource - Resource 对象
 * @returns {string} JSON 字符串
 */
function serialize(resource) {
  if (!resource || typeof resource !== 'object') {
    throw new Error('Invalid resource: must be a non-null object');
  }
  const obj = {};
  for (const field of RESOURCE_FIELDS) {
    if (resource[field] !== undefined) {
      obj[field] = resource[field];
    }
  }
  return JSON.stringify(obj);
}

/**
 * 将 JSON 字符串反序列化为 Resource 对象
 * @param {string} json - JSON 字符串
 * @returns {object} Resource 对象
 */
function deserialize(json) {
  if (typeof json !== 'string') {
    throw new Error('Invalid input: must be a string');
  }
  const parsed = JSON.parse(json);
  const resource = {};
  for (const field of RESOURCE_FIELDS) {
    if (parsed[field] !== undefined) {
      resource[field] = parsed[field];
    }
  }
  return resource;
}

module.exports = { serialize, deserialize, RESOURCE_FIELDS };
