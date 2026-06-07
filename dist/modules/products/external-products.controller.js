"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalProductsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const http_client_service_1 = require("../../http-client/http-client.service");
let ExternalProductsController = class ExternalProductsController {
    httpClient;
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    getPosts() {
        return this.httpClient.get('/posts');
    }
    getPost(id) {
        return this.httpClient.get(`/posts/${id}`);
    }
};
exports.ExternalProductsController = ExternalProductsController;
__decorate([
    (0, common_1.Get)('posts'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch posts from external API (with retry + circuit breaker)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExternalProductsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Get)('posts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch one post from external API (with retry + circuit breaker)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExternalProductsController.prototype, "getPost", null);
exports.ExternalProductsController = ExternalProductsController = __decorate([
    (0, swagger_1.ApiTags)('External API (Axios Retry + Circuit Breaker demo)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('external'),
    __metadata("design:paramtypes", [http_client_service_1.HttpClientService])
], ExternalProductsController);
//# sourceMappingURL=external-products.controller.js.map