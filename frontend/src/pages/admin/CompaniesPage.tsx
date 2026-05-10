import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Eye, Edit, Ban, CheckCircle, Mail, User, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/services/admin.service";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";

interface CompanyItem {
  id: number | string;
  company_name: string;
  email: string;
  commission_rate: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminCompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalType, setModalType] = useState<"view" | "edit" | "add" | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    commission_rate: 10,
  });

  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => AdminService.getCompanies(),
  });


  const approveMutation = useMutation({
    mutationFn: (id: string | number) => AdminService.approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string | number) => AdminService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => AdminService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setModalType(null);
      setFormData({ company_name: "", email: "", password: "", commission_rate: 10 });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: ({ id, rate }: { id: number | string; rate: number }) =>
      AdminService.updateCommission(id, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setModalType(null);
    },
  });

  const companies = response?.companies || [];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      (company.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.is_approved) ||
      (statusFilter === "pending" && !company.is_approved);

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({ company_name: "", email: "", password: "", commission_rate: 10 });
    setModalType("add");
  };

  const handleOpenEdit = (company: CompanyItem) => {
    setSelectedCompany(company);
    setFormData({ ...formData, commission_rate: company.commission_rate || 10 });
    setModalType("edit");
  };

  const handleOpenView = (company: CompanyItem) => {
    setSelectedCompany(company);
    setModalType("view");
  };

  if (isLoading)
    return (
      <AdminLayout>
        <div className="text-center py-20">Đang tải danh sách công ty...</div>
      </AdminLayout>
    );
  if (error)
    return (
      <AdminLayout>
        <div className="text-center py-20 text-red-500">Lỗi tải danh sách.</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Công ty</h1>
          <p className="text-on-surface-variant">Danh sách công ty du lịch trên hệ thống</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Công ty
        </button>
      </div>


      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="filter-status" className="sr-only">
              Trạng thái
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>
        </div>
      </div>


      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Công ty
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Chiết khấu
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className={`hover:bg-surface-container-low transition-colors ${!company.is_active ? "opacity-60 bg-surface-container-lowest" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {company.company_name.charAt(0)}
                      </div>
                      <span className="font-medium text-on-surface">{company.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-on-surface">{company.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface text-sm">
                    {company.commission_rate}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge
                        status={company.is_approved ? "approved" : "pending"}
                        type="company"
                      />
                      {!company.is_active && (
                        <span className="text-[10px] font-bold text-error uppercase">Bị khóa</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {company.created_at ? formatDate(company.created_at) : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenView(company)}
                        className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <div className="w-px h-4 bg-outline-variant mx-1" />

                      {company.is_approved ? (
                        <button
                          onClick={() => toggleStatusMutation.mutate(company.id)}
                          className={`p-2 rounded-lg transition-colors ${company.is_active ? "text-on-surface-variant hover:bg-error-container hover:text-error" : "text-primary hover:bg-primary/10"}`}
                          title={company.is_active ? "Khóa công ty" : "Mở khóa công ty"}
                        >
                          {company.is_active ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => approveMutation.mutate(company.id)}
                          disabled={approveMutation.isPending}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary disabled:opacity-50"
                          title="Duyệt công ty"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <Modal
        isOpen={modalType === "add"}
        onClose={() => setModalType(null)}
        title="Thêm công ty mới"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              full_name: formData.company_name,
              email: formData.email,
              password: formData.password,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Tên công ty</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Đang xử lý..." : "Tạo tài khoản công ty"}
            </button>
          </div>
        </form>
      </Modal>


      <Modal
        isOpen={modalType === "edit"}
        onClose={() => setModalType(null)}
        title="Thiết lập chiết khấu"
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-container rounded-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {selectedCompany?.company_name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-on-surface">{selectedCompany?.company_name}</p>
              <p className="text-sm text-on-surface-variant">{selectedCompany?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Tỷ lệ chiết khấu (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                value={formData.commission_rate}
                onChange={(e) =>
                  setFormData({ ...formData, commission_rate: Number(e.target.value) })
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                %
              </span>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant italic">
              * Tỷ lệ phần trăm doanh thu hệ thống sẽ thu trên mỗi đơn đặt tour thành công của công
              ty này.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() =>
                updateCommissionMutation.mutate({
                  id: selectedCompany.id,
                  rate: formData.commission_rate,
                })
              }
              disabled={updateCommissionMutation.isPending}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {updateCommissionMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </Modal>


      <Modal
        isOpen={modalType === "view"}
        onClose={() => setModalType(null)}
        title="Thông tin công ty"
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl">
                {selectedCompany.company_name.charAt(0)}
              </div>
              <h4 className="text-xl font-bold text-on-surface">{selectedCompany.company_name}</h4>
              <StatusBadge
                status={selectedCompany.is_approved ? "approved" : "pending"}
                type="company"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-medium text-on-surface">{selectedCompany.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                    Ngày gia nhập
                  </p>
                  <p className="text-sm font-medium text-on-surface">
                    {formatDate(selectedCompany.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                    ID Hệ thống
                  </p>
                  <p className="text-sm font-medium text-on-surface">#{selectedCompany.id}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant flex gap-3">
              <button
                onClick={() => handleOpenEdit(selectedCompany)}
                className="flex-1 py-2 px-4 rounded-lg border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
              >
                Cài đặt chiết khấu
              </button>
              <button
                onClick={() => {
                  setModalType(null);
                  toggleStatusMutation.mutate(selectedCompany.id);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${selectedCompany.is_active ? "bg-error-container text-error hover:bg-error/10" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
              >
                {selectedCompany.is_active ? "Khóa tài khoản" : "Mở khóa"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
