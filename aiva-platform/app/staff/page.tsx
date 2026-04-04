import { redirect } from 'next/navigation';

/**
 * /staff → chuyển hướng về module mặc định là CBO
 */
export default function StaffIndexPage() {
    redirect('/staff/cbo');
}
