import { Router } from 'express';
import { getAllUsers, changeUserRole, deleteUser, getAllRooms, forceEndRoom, getSystemAnalytics } from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);
router.get('/rooms', getAllRooms);
router.post('/rooms/:id/force-end', forceEndRoom);
router.get('/analytics', getSystemAnalytics);

export default router;
