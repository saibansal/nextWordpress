declare module "@woocommerce/woocommerce-rest-api" {
  export default class WooCommerceRestApi {
    constructor(config: {
      url: string;
      consumerKey: string;
      consumerSecret: string;
      version?: string;
      queryStringAuth?: boolean;
      wpAPI?: boolean;
      wpAPIPrefix?: string;
      port?: number;
      timeout?: number;
      encoding?: string;
      axiosConfig?: any;
    });

    get(endpoint: string, params?: any): Promise<any>;
    post(endpoint: string, data: any, params?: any): Promise<any>;
    put(endpoint: string, data: any, params?: any): Promise<any>;
    delete(endpoint: string, params?: any): Promise<any>;
    options(endpoint: string, params?: any): Promise<any>;
  }
}
