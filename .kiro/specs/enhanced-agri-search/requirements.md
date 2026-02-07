# Requirements Document

## Introduction

本需求旨在增强"农智汇"平台的搜索与推荐能力，在现有网络聚合搜索基础上，新增搜索联想词、多维度智能筛选、基于标签的相关推荐、以及扩展更多农业数据源。所有功能聚焦于涉农知识领域，面向农民、农技人员、农业研究者等用户群体。

## Glossary

- **Search_Engine**: 农智汇后端搜索服务，负责聚合多源数据并返回结果
- **Suggestion_Service**: 搜索联想词服务，基于农业关键词库提供实时搜索建议
- **Filter_Engine**: 筛选引擎，支持按年份、分类、来源、地区、作物类型等维度过滤结果
- **Recommendation_Service**: 推荐服务，基于资源标签和分类进行相关资源推荐
- **Data_Source_Adapter**: 数据源适配器，负责对接不同农业数据平台并标准化返回结果
- **User**: 平台用户（农民、农技人员、农业研究者等）
- **Resource**: 涉农知识资源（法律法规、政策文件、农技手册、学术论文等）
- **Tag**: 资源标签，用于分类和推荐（如"水稻种植"、"土地承包"、"病虫害防治"）

## Requirements

### Requirement 1: Search Suggestion (搜索联想词)

**User Story:** As a User, I want to see relevant search suggestions while typing in the search box, so that I can quickly find the agricultural knowledge I need without typing the full query.

#### Acceptance Criteria

1. WHEN a User types at least 1 character in the search input, THE Suggestion_Service SHALL return a list of matching suggestions within 300 milliseconds
2. THE Suggestion_Service SHALL maintain an agricultural keyword dictionary containing at least 500 terms covering crops, livestock, policies, laws, and farming techniques
3. WHEN the Suggestion_Service receives a query prefix, THE Suggestion_Service SHALL return up to 8 matching suggestions sorted by relevance
4. WHEN no suggestions match the query prefix, THE Suggestion_Service SHALL return an empty list
5. THE Suggestion_Service SHALL support Chinese pinyin prefix matching (e.g., typing "nong" matches "农业补贴")
6. WHEN a User selects a suggestion, THE Search_Engine SHALL execute a search with the selected suggestion as the keyword

### Requirement 2: Multi-Dimension Filtering (多维度智能筛选)

**User Story:** As a User, I want to filter search results by year, category, source, region, and crop type, so that I can narrow down results to find the most relevant agricultural resources.

#### Acceptance Criteria

1. WHEN search results are displayed, THE Filter_Engine SHALL provide filter options for: publication year, category, source platform, region, and crop type
2. WHEN a User applies one or more filters, THE Filter_Engine SHALL return only resources matching all selected filter criteria
3. WHEN a User removes a filter, THE Filter_Engine SHALL update results to reflect the remaining active filters
4. THE Filter_Engine SHALL display the count of matching resources for each filter option
5. WHEN no resources match the applied filters, THE Filter_Engine SHALL display a message indicating zero results and suggest removing filters
6. THE Filter_Engine SHALL support the following category filters: law (法律法规), policy (政策文件), tech (农技手册), culture (乡土文献), paper (学术论文)
7. THE Filter_Engine SHALL support year range filtering from 2000 to the current year

### Requirement 3: Tag-Based Recommendation (基于标签的相关推荐)

**User Story:** As a User, I want to see related resources when viewing a resource detail page, so that I can discover more relevant agricultural knowledge.

#### Acceptance Criteria

1. WHEN a User views a resource detail page, THE Recommendation_Service SHALL display up to 6 related resources
2. THE Recommendation_Service SHALL compute relatedness based on shared tags, same category, and same source
3. WHEN a resource has fewer than 3 related resources from tag matching, THE Recommendation_Service SHALL supplement with resources from the same category
4. THE Recommendation_Service SHALL exclude the currently viewed resource from the recommendation list
5. THE Recommendation_Service SHALL sort recommended resources by relevance score (number of shared tags) in descending order

### Requirement 4: Extended Agricultural Data Sources (扩展农业数据源)

**User Story:** As a User, I want to search across more agricultural data platforms, so that I can access a wider range of agricultural knowledge resources.

#### Acceptance Criteria

1. THE Data_Source_Adapter SHALL support searching the following additional platforms: National Agricultural Science Data Center (国家农业科学数据中心), China Agricultural University Library (中国农业大学图书馆), and provincial agricultural department websites
2. WHEN the Search_Engine executes a search, THE Search_Engine SHALL query all enabled data sources concurrently
3. WHEN a data source fails to respond within 10 seconds, THE Search_Engine SHALL return results from the remaining sources and log the failure
4. THE Search_Engine SHALL merge results from all sources, remove duplicates based on title similarity, and label each result with its source platform
5. THE Search_Engine SHALL prioritize official government sources (authority level "official") over general sources in the default sort order

### Requirement 5: Smart Sort (智能排序)

**User Story:** As a User, I want search results to be intelligently sorted, so that the most relevant and authoritative resources appear first.

#### Acceptance Criteria

1. THE Search_Engine SHALL support the following sort modes: relevance (default), publication date, authority level, and popularity (view count)
2. WHEN sorting by relevance, THE Search_Engine SHALL compute a composite score based on: keyword match strength (40%), authority level (30%), recency (20%), and popularity (10%)
3. WHEN sorting by authority, THE Search_Engine SHALL rank resources in the order: official (政府官方) > professional (科研机构) > general (一般来源)
4. WHEN a User switches sort mode, THE Search_Engine SHALL re-sort the current result set without re-fetching data
5. THE Search_Engine SHALL display the current active sort mode to the User

### Requirement 6: Search Result Serialization (搜索结果序列化)

**User Story:** As a developer, I want search results to be serialized to JSON for API responses, so that both the Web frontend and miniprogram can consume the same data format.

#### Acceptance Criteria

1. THE Search_Engine SHALL serialize all search results to JSON format containing: _id, title, summary, category, publishTime, source, sourceUrl, tags, authority, and platform fields
2. THE Search_Engine SHALL deserialize JSON search results back into Resource objects with all fields preserved
3. FOR ALL valid Resource objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
