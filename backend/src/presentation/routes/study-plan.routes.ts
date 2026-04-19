import { Router } from 'express'
import { StudyPlanController } from '../controllers/StudyPlanController'

const router = Router()
const ctrl = new StudyPlanController()

router.post('/', ctrl.generate)
router.get('/active/:userId', ctrl.getActive)

export default router
