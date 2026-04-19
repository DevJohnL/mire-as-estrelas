import { Router } from 'express'
import { EssayController } from '../controllers/EssayController'

const router = Router()
const ctrl = new EssayController()

router.post('/evaluate', ctrl.evaluate)
router.get('/topics', ctrl.suggestTopics)

export default router
