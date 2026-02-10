 baseFields =  [
      {
        "field_id": "fldhpFxTvZ",
        "ui_type": "Number",
        "is_primary": true,
        "property": {
          "formatter": "0.0"
        },
        "type": 2,
        "field_name": "id"
      },
      {
        "field_id": "fldm0wwF8b",
        "ui_type": "Text",
        "is_primary": false,
        "property": null,
        "type": 1,
        "field_name": "testF"
      },
      {
        "field_id": "fld0iLuVek",
        "ui_type": "Text",
        "is_primary": false,
        "property": null,
        "type": 1,
        "field_name": "p2d记录"
      },
      {
        "field_id": "fldhRake7p",
        "ui_type": "SingleSelect",
        "is_primary": false,
        "property": {
          "options": [
            {
              "color": 23,
              "name": "去推送",
              "id": "optOVUW78R"
            },
            {
              "color": 35,
              "name": "去删除",
              "id": "optQnLGMUv"
            },
            {
              "color": 26,
              "name": "已推送",
              "id": "opt1zYqgOX"
            },
            {
              "color": 28,
              "name": "已删除",
              "id": "optmLX1dqN"
            },
            {
              "color": 32,
              "name": "准备中",
              "id": "optoxD2Ead"
            },
            {
              "color": 44,
              "name": "推送失败",
              "id": "optY9ihVqF"
            },
            {
              "color": 45,
              "name": "删除失败",
              "id": "optf9oFfUu"
            }
          ]
        },
        "type": 3,
        "field_name": "d2p开关"
      },
      {
        "field_id": "fldmFTas1Q",
        "ui_type": "Text",
        "is_primary": false,
        "property": null,
        "type": 1,
        "field_name": "d2p记录"
      },
      {
        "field_id": "fldhHSuEn9",
        "ui_type": "Text",
        "is_primary": false,
        "property": null,
        "type": 1,
        "field_name": "test2"
      }
    ],
sqlFields = [
      {
        "ui_type": "int",
        "field_name": "id"
      },
      {
        "ui_type": "int",
        "field_name": "testF"
      },
      {
        "ui_type": "varchar",
        "field_name": "test2"
      }
    ]


/**
 * 核心函数：同步sqlFields的ui_type到baseFields（直接修改原数组），并收集需要更新的字段
 * @param {Array} baseFields - 原始基础字段数组（直接修改）
 * @param {Array} sqlFields - SQL字段数组（携带最新ui_type）
 * @returns {Array} 需要更新的字段列表updateFields
 */
function syncFieldUiTypeAndGetUpdates(baseFields, sqlFields) {
  // 步骤1：建立sqlFields的「字段名-最新ui_type」映射表，方便快速查询
  const sqlFieldMap = {};
  sqlFields.forEach((sqlItem) => {
    const { field_name, ui_type } = sqlItem;
    sqlFieldMap[field_name] = ui_type.toLowerCase(); // 统一小写，避免大小写匹配问题
  });

  // 步骤2：定义固定映射规则（解决不同体系类型不匹配的核心）
  // 2.1 sql ui_type → base type 映射
  const getTargetTypeBySqlUiType = (sqlUiType) => {
    const type2Uis = ['int', 'tinyint', 'decimal'];
    const type5Uis = ['timestamp', 'date'];
    if (type2Uis.includes(sqlUiType)) {
      return 2;
    } else if (type5Uis.includes(sqlUiType)) {
      return 5;
    } else {
      return 1; // varchar及其他类型默认映射为1
    }
  };

  // 2.2 sql ui_type → base ui_type 映射（同步base的ui_type显示）
  const getBaseUiTypeBySqlUiType = (sqlUiType) => {
    const sqlUiTypeLower = sqlUiType.toLowerCase();
    const type2Uis = ['int', 'tinyint', 'decimal'];
    const type5Uis = ['timestamp', 'date'];

    if (type2Uis.includes(sqlUiTypeLower)) {
      return 'Number'; // sql数字类型对应base的Number
    } else if (type5Uis.includes(sqlUiTypeLower)) {
      return 'DateTime'; // sql日期类型对应base的DateTime
    } else {
      return 'Text'; // sql字符串类型对应base的Text
    }
  };

  // 步骤3：初始化updateFields数组
  const updateFields = [];

  // 步骤4：遍历baseFields，直接修改原数组，判断并收集需要更新的字段
  baseFields.forEach((baseItem) => {
    const { field_name, type: currentType } = baseItem;
    const latestSqlUiType = sqlFieldMap[field_name];

    // 仅处理sqlFields中存在的同名字段（不存在的字段不做处理）
    if (latestSqlUiType) {
      // 计算对应的目标type和目标base ui_type
      const targetType = getTargetTypeBySqlUiType(latestSqlUiType);
      const targetBaseUiType = getBaseUiTypeBySqlUiType(latestSqlUiType);

      // 修正判断逻辑：仅当type不一致时，才判定为需要更新（避免ui_type字符串误判）
      if (currentType !== targetType) {
        // 步骤4.1：直接修改原始baseFields中的ui_type和type
        baseItem.ui_type = targetBaseUiType;
        baseItem.type = targetType;

        // 步骤4.2：将指定字段信息推入updateFields
        updateFields.push({
          field_id: baseItem.field_id,
          type: targetType, // 存入更新后的type
          field_name: field_name,
        });
      }
    }
  });

  // 步骤5：返回需要更新的字段列表
  return updateFields;
}

// 原有新增字段函数（如需保留可继续使用）
function getAddFields(baseFields, sqlFields) {
  const baseFieldNames = baseFields.map((item) => item.field_name);
  const addFields = [];
  const type2Uis = ['int', 'tinyint', 'decimal'];
  const type5Uis = ['timestamp', 'date'];

  sqlFields.forEach((sqlItem) => {
    const { field_name, ui_type } = sqlItem;
    if (!baseFieldNames.includes(field_name)) {
      let type;
      const lowerUiType = ui_type.toLowerCase();
      if (type2Uis.includes(lowerUiType)) {
        type = 2;
      } else if (type5Uis.includes(lowerUiType)) {
        type = 5;
      } else {
        type = 1;
      }
      addFields.push({
        type,
        field_name,
      });
    }
  });

  return addFields;
}


// 处理字段同步更新，获取需要更新的字段列表
  const updateFields = syncFieldUiTypeAndGetUpdates(baseFields, sqlFields);

  console.log(updateFields);
  