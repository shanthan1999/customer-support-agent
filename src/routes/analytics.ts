import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// In-memory storage references (same as tickets route)
declare const tickets: Map<string, any>;
declare const feedback: Map<string, any[]>;

/**
 * GET /api/analytics/stats
 * Get classification statistics
 */
router.get('/stats', 
  optionalAuth,
  (req: Request, res: Response) => {
    try {
      const allTickets = Array.from(tickets.values());
      
      if (allTickets.length === 0) {
        return res.json({
          success: true,
          data: {
            total: 0,
            message: 'No tickets processed yet'
          }
        });
      }
      
      // Calculate statistics
      const stats = {
        total: allTickets.length,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        bySource: {} as Record<string, number>,
        averageConfidence: 0,
        averageProcessingTime: 0,
        lowConfidenceCount: 0,
        feedbackCount: Array.from(feedback.values()).flat().length
      };
      
      let totalConfidence = 0;
      let totalProcessingTime = 0;
      
      allTickets.forEach(ticket => {
        // Category distribution
        const category = ticket.classification?.category || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // Priority distribution
        const priority = ticket.classification?.priority || 'Unknown';
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        
        // Source distribution
        const source = ticket.source || 'Unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
        
        // Confidence and processing time
        if (ticket.classification?.confidence) {
          totalConfidence += ticket.classification.confidence;
          if (ticket.classification.confidence < 70) {
            stats.lowConfidenceCount++;
          }
        }
        
        if (ticket.processingTime) {
          totalProcessingTime += ticket.processingTime;
        }
      });
      
      stats.averageConfidence = Math.round(totalConfidence / allTickets.length);
      stats.averageProcessingTime = Math.round(totalProcessingTime / allTickets.length);
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        error: 'Failed to generate analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/trends
 * Get classification trends over time
 */
router.get('/trends', 
  optionalAuth,
  (req: Request, res: Response) => {
    try {
      const { period = 'day' } = req.query;
      const allTickets = Array.from(tickets.values());
      
      if (allTickets.length === 0) {
        return res.json({
          success: true,
          data: {
            trends: [],
            message: 'No tickets processed yet'
          }
        });
      }
      
      // Group tickets by time period
      const trends = new Map<string, {
        date: string;
        count: number;
        avgConfidence: number;
        avgProcessingTime: number;
        categories: Record<string, number>;
        priorities: Record<string, number>;
      }>();
      
      allTickets.forEach(ticket => {
        const date = new Date(ticket.createdAt);
        let periodKey: string;
        
        switch (period) {
          case 'hour':
            periodKey = date.toISOString().slice(0, 13) + ':00:00.000Z';
            break;
          case 'day':
            periodKey = date.toISOString().slice(0, 10);
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().slice(0, 10);
            break;
          default:
            periodKey = date.toISOString().slice(0, 10);
        }
        
        if (!trends.has(periodKey)) {
          trends.set(periodKey, {
            date: periodKey,
            count: 0,
            avgConfidence: 0,
            avgProcessingTime: 0,
            categories: {},
            priorities: {}
          });
        }
        
        const trend = trends.get(periodKey)!;
        trend.count++;
        
        if (ticket.classification?.confidence) {
          trend.avgConfidence += ticket.classification.confidence;
        }
        
        if (ticket.processingTime) {
          trend.avgProcessingTime += ticket.processingTime;
        }
        
        const category = ticket.classification?.category || 'Unknown';
        trend.categories[category] = (trend.categories[category] || 0) + 1;
        
        const priority = ticket.classification?.priority || 'Unknown';
        trend.priorities[priority] = (trend.priorities[priority] || 0) + 1;
      });
      
      // Calculate averages
      const trendData = Array.from(trends.values()).map(trend => ({
        ...trend,
        avgConfidence: Math.round(trend.avgConfidence / trend.count),
        avgProcessingTime: Math.round(trend.avgProcessingTime / trend.count)
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        success: true,
        data: {
          period,
          trends: trendData
        }
      });
      
    } catch (error) {
      console.error('Trends error:', error);
      res.status(500).json({
        error: 'Failed to generate trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;