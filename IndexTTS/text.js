// 原始数据
baseData = [
      {
        "record_id": "recv6PpZEbrm5j",
        "fields": {
          "password": [
            {
              "text": "c1afbdc9e2b64d922b43de8c58",
              "type": "text"
            }
          ],
          "update_time": 1766935588000,
          "nickname": [
            {
              "text": "超级管理员",
              "type": "text"
            }
          ],
          "id": 1,
          "status": 1,
          "token": [
            {
              "text": "9tykir1nLCLmypBNNOUQ6vt54CObPwgn11766935588.2185",
              "type": "text"
            }
          ],
          "username": [
            {
              "text": "admin",
              "type": "text"
            }
          ]
        }
      },
      {
        "record_id": "recv6PpZEbmKya",
        "fields": {
          "password": [
            {
              "text": "adc3949ba59abbe56e057f20f8",
              "type": "text"
            }
          ],
          "update_time": 1766209906000,
          "create_time": 1749000279000,
          "nickname": [
            {
              "text": "lianghq",
              "type": "text"
            }
          ],
          "id": 2,
          "status": 1,
          "token": [
            {
              "text": "nWCTm9tGmzu3gOMl71IIOY29B9JZwn6621766209906.2112",
              "type": "text"
            }
          ],
          "username": [
            {
              "text": "lianghq",
              "type": "text"
            }
          ]
        }
      },
      {
        "record_id": "recv6PpZEbDTWx",
        "fields": {
          "password": [
            {
              "text": "adc3949ba59abbe56e057f20f8",
              "type": "text"
            }
          ],
          "update_time": 1766209938000,
          "create_time": 1766209938000,
          "nickname": [
            {
              "text": "超级管理",
              "type": "text"
            }
          ],
          "id": 4,
          "status": 1,
          "username": [
            {
              "text": "chaojiguanli",
              "type": "text"
            }
          ]
        }
      }
    ],
sqlData =  [
      {
        "password": "c1afbdc9e2b64d922b43de8c58",
        "update_time": 1766935588000,
        "delete_time": null,
        "create_time": null,
        "nickname": "超级管理员",
        "id": 1,
        "status": true,
        "token": "9tykir1nLCLmypBNNOUQ6vt54CObPwgn11766935588.2185",
        "username": "admin"
      },
      {
        "password": "adc3949ba59abbe56e057f20f8",
        "update_time": 1766209906000,
        "delete_time": null,
        "create_time": 1749000279000,
        "nickname": "lianghq",
        "id": 2,
        "status": true,
        "token": "nWCTm9tGmzu3gOMl71IIOY29B9JZwn6621766209906.2112",
        "username": "lianghq"
      },
      {
        "password": "adc3949ba59abbe56e057f20f8",
        "update_time": 1766209938000,
        "delete_time": null,
        "create_time": 1766209938000,
        "nickname": "超级管理",
        "id": 4,
        "status": true,
        "token": null,
        "username": "chaojiguanli"
      }
    ]

function formatBaseFields(fields) {
  const formatted = {};
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value) && value.length > 0 && Object.prototype.hasOwnProperty.call(value[0], 'text')) {
      formatted[key] = value[0].text;
    } else {
      formatted[key] = value;
    }
  }
  return formatted;
}

/**
 * 转换baseData为与sqlData结构一致的中间数据，并保留record_id
 * @returns {Object} 包含映射表和原始列表 { baseMap: {}, baseList: [] }
 */
function transformBaseData() {
  const baseMap = {};
  const baseList = [];
  baseData.forEach(item => {
    const formattedFields = formatBaseFields(item.fields);
    const baseItem = {
      ...formattedFields,
      record_id: item.record_id
    };
    const id = formattedFields.id;
    baseMap[id] = baseItem; // key是baseData的id（1、2）
    baseList.push(baseItem);
  });
  return { baseMap, baseList };
}

/**
 * 处理sqlData字段：将布尔类型的status转为数字（true→1，false→0）
 * @param {Object} sqlItem - 单个sqlData项
 * @returns {Object} 处理后的sqlItem
 */
function processSqlStatus(sqlItem) {
  const processedItem = { ...sqlItem };
  if (typeof processedItem.status === 'boolean') {
    processedItem.status = processedItem.status ? 1 : 0;
  }
  return processedItem;
}

/**
 * 为sqlData建立id映射表（同时处理status字段类型转换）
 * @returns {Object} sqlData的id映射表
 */
function createSqlMap() {
  const sqlMap = {};
  sqlData.forEach(item => {
    const processedItem = processSqlStatus(item);
    const id = processedItem.id;
    sqlMap[id] = processedItem; // key是sqlData的id（1、2、4、5）
  });
  return sqlMap;
}

/**
 * 对比baseData和sqlData，返回addData、updateData、deleteData
 * @returns {Object} 三类结果数据
 */
function compareData() {
  const { baseMap, baseList } = transformBaseData();
  const sqlMap = createSqlMap();

  const addData = [];
  const updateData = [];
  const deleteData = [];

  // 优化点1：筛选addData时，直接复用sqlMap，避免重复转换，逻辑更清晰
  // 遍历sqlMap的key（sqlData的id），判断是否在baseMap中不存在
  Object.keys(sqlMap).forEach(sqlId => {
    const id = Number(sqlId); // 转为数字，与baseMap的id类型一致
    const sqlItem = sqlMap[id];
    // 只有baseMap中没有该id，才是真正的新增数据
    if (!baseMap[id]) {
      // 还原原始sqlItem的status（可选，根据需求决定是否保留布尔值）
      const originalSqlItem = sqlData.find(item => item.id === id);
      addData.push({
        fields: { ...originalSqlItem }
      });
    }
  });

  // 筛选updateData和deleteData：遍历baseData
  baseList.forEach(baseItem => {
    const id = baseItem.id;
    const record_id = baseItem.record_id;
    const { record_id: _, ...baseBizFields } = baseItem;

    if (sqlMap[id]) {
      // 双方都存在（id=1、2），对比字段差异
      const sqlItem = sqlMap[id];
      let isNeedUpdate = false;
      const updateFields = {};

      const commonKeys = [...new Set([
        ...Object.keys(baseBizFields),
        ...Object.keys(sqlItem)
      ])].filter(key => baseBizFields.hasOwnProperty(key) && sqlItem.hasOwnProperty(key));

      commonKeys.forEach(key => {
        const baseValue = baseBizFields[key];
        const sqlValue = sqlItem[key];
        const isEqual = JSON.stringify(baseValue) === JSON.stringify(sqlValue);

        if (!isEqual) {
          isNeedUpdate = true;
          const originalSqlItem = sqlData.find(item => item.id === id);
          updateFields[key] = originalSqlItem[key];
        }
      });

      if (isNeedUpdate) {
        updateData.push({
          fields: updateFields,
          record_id: record_id
        });
      }
    } else {
      // base存在，sql不存在（当前无此场景，若需测试可删除baseData的id=1）
      deleteData.push({
        fields: {
          ...baseBizFields,
          p2d: "已删除"
        },
        record_id: record_id
      });
    }
  });

  return {
    addData,
    updateData,
    deleteData
  };
}

// 执行对比
const { addData, updateData, deleteData } = compareData();

// 打印结果
console.log("===== 新增数据 addData（仅sql存在，base不存在） =====");
console.log(JSON.stringify(addData, null, 2));
console.log("===== 更新数据 updateData（双方都存在，字段不一致） =====");
console.log(JSON.stringify(updateData, null, 2));
console.log("===== 删除数据 deleteData（仅base存在，sql不存在） =====");
console.log(JSON.stringify(deleteData, null, 2));