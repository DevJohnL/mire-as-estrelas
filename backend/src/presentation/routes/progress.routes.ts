import { Router } from 'express'
import { ProgressController } from '../controllers/ProgressController'

const router = Router()
const ctrl = new ProgressController()

router.get('/:userId', ctrl.get)

export default router
