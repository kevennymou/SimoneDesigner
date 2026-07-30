import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  getReport(@Query() query: ReportQueryDto) {
    return this.reports.getReport(query.from, query.to);
  }

  @Get('export.csv')
  async exportCsv(@Query() query: ReportQueryDto, @Res() res: Response) {
    const csv = await this.reports.exportCsv(query.from, query.to);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-${query.from}-a-${query.to}.csv"`,
    );
    res.send('﻿' + csv);
  }
}
