import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn','api.xunkecloud.cn',];
// 通过addDomainList添加请求接口的域名，不可写多个addDomainList，否则会被覆盖
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com',]);

basekit.addField({
  // 定义捷径的i18n语言资源
   i18n: {
    messages: {
      'zh-CN': {
        'videoMethod': '模型选择',
        'videoPrompt': '视频提示词',
        'refImage': '参考图片',
        'seconds': '视频时长',
        'size': '视频尺寸',
        'modelBrand':'迅客'

      },
      'en-US': {
        'videoMethod': 'Model selection',
        'videoPrompt': 'Video prompt',
        'refImage': 'Reference image',
        'seconds': 'Video duration',
        'size': 'Video size',   
        'modelBrand':'Xunke'

      },
      'ja-JP': {
        'videoMethod': 'モデル選択',
        
        'videoPrompt': 'ビデオ提示词',
        'refImage': '参考画像',
        'seconds': 'ビデオ再生時間',
        'size': 'ビデオサイズ',   
        'modelBrand':'Xunke'

      },
    }
  },

  authorizations: [
    {
      id: 'auth_id_1',
      platform: 'xunkecloud',
      type: AuthorizationType.HeaderBearerToken,
      required: true,
      instructionsUrl: "http://api.xunkecloud.cn/login",
      label: '关联账号',
      icon: {
        light: '',
        dark: ''
      }
    }
  ],
  // 定义捷径的入参
  formItems: [ 
    {
      key: 'videoMethod',
      label: t('videoMethod'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: 'doubao-seedance-2-0-480p', value: 'doubao-seedance-2-0-480p'},
      props: {
        options: [
          { label: t('modelBrand') +' SR-2', value: 'sora-2'},
          { label: t('modelBrand') +' gr-6s', value: 'grok-video-3'},
          { label: t('modelBrand') +' gr-10s', value: 'grok-video-3-10s'},
          { label: t('modelBrand') +' gr-15s', value: 'grok-video-3-15s'},
          { label: t('modelBrand') +' gr-20s', value: 'grok-video-3-20s'},
          { label: t('modelBrand') +' gr-30s', value: 'grok-video-3-30s'},
          { label: 'doubao-seedance-1-5-pro_480p', value: 'doubao-seedance-1-5-pro_480p'},
          { label: 'doubao-seedance-1-5-pro_720p', value: 'doubao-seedance-1-5-pro_720p'},
          { label: 'doubao-seedance-1-5-pro_1080p', value: 'doubao-seedance-1-5-pro_1080p'},
          { label: 'doubao-seedance-2-0-480p', value: 'doubao-seedance-2-0-480p'},
          { label: 'doubao-seedance-2-0-720p', value: 'doubao-seedance-2-0-720p'},
          { label: 'doubao-seedance-2-0-fast_480p', value: 'doubao-seedance-2-0-fast_480p'},
          { label: 'doubao-seedance-2-0-fast_720p', value: 'doubao-seedance-2-0-fast_720p'},


        ]
      },
    },
    {
      key: 'videoPrompt',
      label: t('videoPrompt'),
      component: FieldComponent.Input,
      props: {
        placeholder: '请输入视频提示词',
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'refImage',
      label: t('refImage'),
      component: FieldComponent.FieldSelect,
       props: {
        mode: 'multiple',
        supportType: [FieldType.Attachment],
        placeholder: '请选择参考图片',
      }
    },
    {
      key: 'seconds',
      label: t('seconds'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: t('15'), value: '15'},
      props: {
        options: [
          { label: '4', value: '4'},
          { label: '5', value: '5'},
          { label: '6', value: '6'},
          { label: '7', value: '7'},
          { label: '8', value: '8'},
          { label: '9', value: '9'},
          { label: '10', value: '10'},
          { label: '11', value: '11'},
          { label: '12', value: '12'},
          { label: '13', value: '13'},
          { label: '14', value: '14'},
          { label: '15', value: '15'},
        ]
      },
    },
    {
      key: 'size',
      label: t('size'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label:'adaptive', value: 'adaptive'},
      props: {
        options: [
          { label: 'adaptive', value: 'adaptive' },
          { label: '1:1', value: '1:1' }, 
          { label: '16:9', value: '16:9' }, 
          { label: '9:16', value: '9:16' }, 
          { label: '4:3', value: '4:3' }, 
          { label: '3:4', value: '3:4' }, 
          { label: '21:9', value: '21:9' }, 
        ]
      },
    },
    
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Attachment
  },
  execute: async (formItemParams: { videoMethod: any, videoPrompt: string, refImage: any,seconds:any,size:any }, context) => {
    const { videoMethod = '', videoPrompt = '', refImage = '',seconds='',size='' } = formItemParams;


     /** 为方便查看日志，使用此方法替代console.log */
    function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }))
    }

        function extractAllTmpUrls(data) {
    // 存储所有提取到的 tmp_url
    const tmpUrlList = [];

    // 递归遍历函数
    function traverse(currentData) {
        // 跳过 null/undefined
        if (currentData === null || typeof currentData === 'undefined') {
            return;
        }

        // 如果是对象（数组/普通对象）
        if (typeof currentData === 'object') {
            // 检查当前对象是否有有效 tmp_url
            if (
                'tmp_url' in currentData && 
                typeof currentData.tmp_url === 'string' && 
                currentData.tmp_url.trim()
            ) {
                tmpUrlList.push(currentData.tmp_url.trim());
            }

            // 遍历所有子元素（跳过原型链属性）
            for (const key in currentData) {
                if (currentData.hasOwnProperty(key)) {
                    traverse(currentData[key]);
                }
            }
        }
    }

    // 开始遍历传入的数据
    traverse(data);
    // 返回去重后的数组，不限制图片数量
    return [...new Set(tmpUrlList)];
}
    
    // 常量定义
    const API_BASE_URL = 'https://api.xunkecloud.cn/v1/videos';
    const POLLING_INTERVAL = 5000; // 5秒间隔
    const MAX_POLLING_TIME = 900000; // 900秒最大等待时间

    // 错误视频URL配置
    const ERROR_VIDEOS = {
      DEFAULT: 'https://pay.xunkecloud.cn/image/Wrong.mp4',
      OVERRUN: 'https://pay.xunkecloud.cn/image/Overrun.mp4',
      NO_CHANNEL: 'https://pay.xunkecloud.cn/image/unusual.mp4',
      INSUFFICIENT: 'https://pay.xunkecloud.cn/image/Insufficient.mp4',
      INVALID_TOKEN: 'https://pay.xunkecloud.cn/image/tokenError.mp4'
    };

    // 创建错误响应的辅助函数
    const createErrorResponse = (name: string, videoUrl: string) => ({
      code: FieldCode.Success,
      data: [{
        name: `${name}.mp4`,
        content: videoUrl,
        contentType: 'attachment/url'
      }]
    });

    try {

      // 提取参考图片URL
      let referenceImages = extractAllTmpUrls(refImage);
      
      // 如果模型包含sora或grok，则只提取一张图片
      if (videoMethod.value.includes('sora') || videoMethod.value.includes('grok')) {
        referenceImages = referenceImages.slice(0, 1);
      }

       if (videoMethod.value.includes('doubao-seedance-2-0')) {
        referenceImages = referenceImages.slice(0, 9);
      }
      if (videoMethod.value.includes('doubao-seedance-1-5')) {
        referenceImages = referenceImages.slice(0, 2);
      }

      // 构建请求体
      let requestBody: any = {
        model: videoMethod.value,
        prompt: videoPrompt,
        seconds: seconds.value,
        size: size.value,
        input_reference: referenceImages,
      };


      

      if (videoMethod.value.includes('seedance')) { 

        requestBody= {
        model: videoMethod.value,
        prompt: videoPrompt,
        images: referenceImages,
        metadata:{
          ratio: size.value,
          duration: Number(seconds.value),
          resolution: videoMethod.value.split('_').pop()
        }
      };
         if(seconds.value >= 13 && !videoMethod.value.includes('doubao-seedance-2-0')){
          requestBody.metadata.duration = 12;
        }

        // 拼接模型名称和视频时长
        const modelValue = videoMethod.value;
        const secondsValue = requestBody.metadata.duration;
        // 检查模型值是否包含下划线
         if (modelValue.includes('doubao-seedance-2-0')) {
            requestBody.model = `${modelValue}_${secondsValue}s`;
          } else {
            const parts = modelValue.split('_');
            // 重新组合，在最后一个下划线前添加时长信息
            const baseModel = parts.slice(0, -1).join('_');
            const resolution = parts[parts.length - 1];
            requestBody.model = `${baseModel}_${secondsValue}s_${resolution}`;
          }
      }



       if (videoMethod.value.includes('sora')) {        
        if (size.value === 'adaptive' || size.value === '720x1280' || size.value === '1024x1792' || size.value === '1:1'  || size.value === '9:16'  || size.value === '3:4' ) {
          requestBody.size = '720x1280';
        }else{
          requestBody.size = '1280x720';
        }

        if(seconds.value <= 10){
          requestBody.seconds = "10";
        }else{
          requestBody.seconds = "15";
        }
      }

      if (videoMethod.value.includes('grok')) {
        delete requestBody.seconds;
        
        if (size.value === 'adaptive' ) {
          requestBody.size = '1:1';
        }else if(size.value === '3:4'){
          requestBody.size = '2:3';
        }else if(size.value === '4:3'){
          requestBody.size = '3:2';
        }else if(size.value === '21:9'){
          requestBody.size = '16:9';
        }
      }

      console.log(requestBody);
      
      

      // 创建视频生成任务
      const createTask = await context.fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, 'auth_id_1');

      const taskResp: any = await createTask.json();
      
      console.log(taskResp.message);


      // 检查任务ID是否返回
      if (taskResp?.id) {
        // 轮询获取视频详情
        const videoDetailUrl = `${API_BASE_URL}/${taskResp.id}`;
        const detailRequestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };

        const startTime = Date.now();
        let videoDetailResp: any;
        let isPollingComplete = false;

          debugLog("开始轮询任务");
        // 轮询逻辑
        while (!isPollingComplete && (Date.now() - startTime) < MAX_POLLING_TIME) {
          const getTaskDetail = await context.fetch(videoDetailUrl, detailRequestOptions, 'auth_id_1');
          videoDetailResp = await getTaskDetail.json();
          
          // 检查状态
          if (videoDetailResp?.status === 'failed') {
            debugLog({ message: '视频生成失败', errorType: '官方错误，提示词/图片违规' });
            return createErrorResponse('官方错误，提示词/图片违规', ERROR_VIDEOS.DEFAULT);
          } else if (videoDetailResp?.status === 'completed' || videoDetailResp?.status === 'succeeded') {
            isPollingComplete = true;
            debugLog({ message: '视频生成完成' });
          } else {
            // 未完成，等待后继续轮询
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          }
        }

        console.log(videoDetailResp);
        

        // 检查是否超时
        if (!isPollingComplete) {
          debugLog({ message: '视频生成超时', errorType: '轮询超时' });
          return {
            code: FieldCode.Error,
            data: createErrorResponse('捷径异常', ERROR_VIDEOS.OVERRUN).data
          };
        }

        // 提取视频URL并返回成功响应
        const videoUrl = videoDetailResp?.video_url || '';
        console.log(videoUrl);
        
        return {
          code: FieldCode.Success,
          data: [{
            name: `${taskResp.id}.mp4`,
            content: videoUrl,
            contentType: 'attachment/url'
          }]
        };
      } else {
        throw new Error(taskResp?.error?.message ||taskResp?.message);
      }
    } catch (error: any) {
      const errorMessage = String(error);
      debugLog({ '异常错误': errorMessage });

      // 根据错误类型返回相应的错误视频
      if (errorMessage.includes('渠道')) {
        debugLog({ message: '无可用渠道', errorType: '渠道错误', errorMessage });
        return createErrorResponse('捷径异常', ERROR_VIDEOS.NO_CHANNEL);
      } else if (errorMessage.includes('额度')||errorMessage.includes('余额')||errorMessage.includes('quota')) {
        debugLog({ message: '令牌额度已用尽', errorType: '余额不足', errorMessage });
        return createErrorResponse('余额耗尽', ERROR_VIDEOS.INSUFFICIENT);
      } else if (errorMessage.includes('令牌')) {
        debugLog({ message: '无效的令牌', errorType: '令牌错误', errorMessage });
        return createErrorResponse('无效的令牌', ERROR_VIDEOS.INVALID_TOKEN);
      }

      // 未知错误
      return {
        code: FieldCode.Error
      };
    }
  }
});
export default basekit;