import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    check(): {
        status: string;
        uptime: number;
        checks: {
            database: string;
            memory: {
                heapUsedMB: number;
                heapTotalMB: number;
                rssMB: number;
            };
        };
    };
}
