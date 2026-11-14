import type { handleLogOut as logOut } from '../services/authService';

export const handleLogOut = vi.fn<typeof logOut>();
