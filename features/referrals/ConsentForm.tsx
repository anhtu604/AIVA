'use client';

import { useState, useEffect } from 'react';
import { createReferral } from '@/services/database/referrals';
import { getOrganizations } from '@/services/database/organizations';
import { AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface Organization {
    id: string;
    name: string;
    level: string;
}

interface ConsentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    sessionId?: string;
    riskData?: Record<string, any>;
}

export default function ConsentForm({ onSuccess, onCancel, sessionId, riskData }: ConsentFormProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    
    const [phone, setPhone] = useState('');
    const [targetOrgId, setTargetOrgId] = useState('');
    const [consentGiven, setConsentGiven] = useState(false);
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrgs() {
            try {
                const data = await getOrganizations();
                setOrganizations(data);
            } catch (err) {
                console.error("Lỗi lấy danh sách Đơn vị:", err);
            } finally {
                setLoadingOrgs(false);
            }
        }
        fetchOrgs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!phone.trim()) {
            setError("Vui lòng nhập số điện thoại hoặc Zalo để liên hệ.");
            return;
        }

        if (!targetOrgId) {
            setError("Vui lòng chọn đơn vị tiếp nhận.");
            return;
        }

        if (!consentGiven) {
            setError("Vui lòng đánh dấu đồng ý trước khi chuyển tuyến.");
            return;
        }

        setSubmitting(true);

        try {
            await createReferral({
                sessionId,
                targetOrgId,
                phone,
                consentGiven,
                riskData
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Submission error:", err);
            setError(err.message || 'Có lỗi xảy ra khi tạo phiếu chuyển tuyến.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full">
            <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
                <ShieldCheck className="text-indigo-100 w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Chuyển Tuyến An Toàn</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-slate-800">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900 leading-relaxed shadow-sm">
                    <p className="font-semibold mb-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-600" /> Cam kết bảo mật
                    </p>
                    AIVA Care tôn trọng tối đa quyền riêng tư của bạn. Thông tin bạn cung cấp (số điện thoại / Zalo) sẽ được mã hóa và <strong>chỉ chia sẻ cho đơn vị y tế/cộng đồng mà bạn chọn</strong> để hỗ trợ kết nối dịch vụ an toàn.
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            SĐT / Zalo của bạn (Ẩn danh)
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Chọn Đơn vị tiếp nhận tư vấn
                        </label>
                        <select
                            value={targetOrgId}
                            onChange={(e) => setTargetOrgId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            disabled={loadingOrgs || submitting}
                        >
                            <option value="">{loadingOrgs ? 'Đang tải danh sách...' : '-- Chọn đơn vị --'}</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>
                                    {org.name} ({org.level})
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-start gap-3 mt-4 group cursor-pointer">
                        <div className="relative flex items-center justify-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={consentGiven}
                                onChange={(e) => setConsentGiven(e.target.checked)}
                                disabled={submitting}
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all peer"
                            />
                        </div>
                        <span className="text-sm text-slate-600 leading-snug select-none group-hover:text-slate-800 transition-colors">
                            Tôi đã hiểu rủi ro và <strong>đồng ý chia sẻ thông tin này</strong> cho đơn vị tiếp nhận nhằm mục đích hỗ trợ sức khỏe.
                        </span>
                    </label>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || loadingOrgs || (!phone || !targetOrgId || !consentGiven)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 outline-none flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> Đồng ý chuyển tuyến
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
