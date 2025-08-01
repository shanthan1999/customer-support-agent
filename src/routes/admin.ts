import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../middleware/auth';
import { ClassificationEngine } from '../classification/engine';

const router = Router();

// Admin routes require authentication
router.use(authenticateApiKey);

// Lazy initialization of classification engine
let engine: ClassificationEngine | null = null;

function getEngine(): ClassificationEngine {
  if (!engine) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    engine = new ClassificationEngine(
      apiKey,
      parseInt(process.env.CONFIDENCE_THRESHOLD || '70'),
      3,
      process.env.MODEL_NAME || 'gpt-4o'
    );
  }
  return engine;
}

/**
 * GET /api/admin/config
 * Get current system configuration
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      ...getEngine().getClassificationStats(),
      categories: [
        'Technical',
        'Billing', 
        'General Inquiry',
        'Bug Report',
        'Feature Request',
        'Account',
        'Security',
        'Performance',
        'Integration'
      ],
      priorityLevels: ['Low', 'Medium', 'High', 'Critical', 'Urgent'],
      severityLevels: ['Minor', 'Moderate', 'Major', 'Critical', 'Emergency'],
      impactLevels: ['Individual', 'Department', 'Organization', 'System-wide'],
      urgencyLevels: ['Can wait', 'Normal', 'Soon', 'ASAP', 'Immediate'],
      sources: ['email', 'web', 'api'],
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/config/confidence-threshold
 * Update confidence threshold
 */
router.put('/config/confidence-threshold', (req: Request, res: Response) => {
  try {
    const { threshold } = req.body;
    
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
      return res.status(400).json({
        error: 'Invalid threshold',
        message: 'Threshold must be a number between 0 and 100'
      });
    }
    
    getEngine().updateConfidenceThreshold(threshold);
    
    res.json({
      success: true,
      message: `Confidence threshold updated to ${threshold}%`,
      data: { threshold }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update threshold',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/memory/clear
 * Clear classification memory
 */
router.post('/memory/clear', async (req: Request, res: Response) => {
  try {
    await getEngine().clearMemory();
    
    res.json({
      success: true,
      message: 'Classification memory cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear memory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/health
 * System health check
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        mongodb: !!process.env.MONGODB_URI
      }
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;