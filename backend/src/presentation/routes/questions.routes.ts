import { Router } from 'express'
import { QuestionsController } from '../controllers/QuestionsController'

const router = Router()
const ctrl = new QuestionsController()

router.get('/', ctrl.listQuestions)
router.post('/seed', ctrl.seedQuestions)
router.post('/evaluate', ctrl.evaluate)
router.patch('/performances/:performanceId/self-assessment', ctrl.updateSelfAssessment)
router.get('/:id', ctrl.getQuestion)

export default router
