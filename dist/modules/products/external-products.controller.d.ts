import { HttpClientService } from '../../http-client/http-client.service';
interface ExternalPost {
    id: number;
    title: string;
    body: string;
    userId: number;
}
export declare class ExternalProductsController {
    private readonly httpClient;
    constructor(httpClient: HttpClientService);
    getPosts(): Promise<ExternalPost[]>;
    getPost(id: string): Promise<ExternalPost>;
}
export {};
