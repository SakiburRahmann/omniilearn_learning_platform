"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { api } from "@/utils/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, UserPlus, UserMinus, Eye, Globe, Pencil } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#AFAFAF",
  IN_REVIEW: "#FFC800",
  PUBLISHED: "#58CC02",
  REJECTED: "#FF4B4B",
};

function CoursesContent() {
  const { data: courses, isLoading, refetch } = api.admin.listCourses.useQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const createCourse = api.admin.createCourse.useMutation({
    onSuccess: (data) => {
      toast.success(`Course created: ${data.slug}`);
      setShowCreateModal(false);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = api.admin.updateCourseStatus.useMutation({
    onSuccess: () => { toast.success("Course status updated."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const removeCreator = api.admin.removeCreator.useMutation({
    onSuccess: () => { toast.success("Creator removed."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const assignCreator = api.admin.assignCreator.useMutation({
    onSuccess: () => { toast.success("Creator assigned."); setShowAssignModal(null); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  // Fetch creators for assignment
  const { data: creatorsData } = api.admin.listUsers.useQuery(
    { page: 1, limit: 100, role: "COURSE_CREATOR" },
    { enabled: !!showAssignModal }
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#4B4B4B] tracking-tight">Course Management</h1>
          <p className="text-[#AFAFAF] font-bold text-sm mt-1">
            {courses ? `${courses.length} total courses` : "Loading..."}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="duo-button-primary flex items-center gap-2 text-sm px-6 py-3">
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="duo-card p-6 animate-pulse bg-gray-50 h-28 rounded-2xl" />
          ))
        ) : courses?.map((course: any) => (
          <div key={course.id} className="duo-card p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-black text-[#4B4B4B]">{course.title}</h3>
                  <span
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: `${STATUS_COLORS[course.status]}15`, color: STATUS_COLORS[course.status] }}
                  >
                    {course.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#AFAFAF] mb-3">
                  {course.difficulty} • {course._count.units} units • {course._count.lessons} lessons • {course._count.enrollments} enrolled
                </p>

                {/* Assigned Creators */}
                <div className="flex flex-wrap gap-2">
                  {course.creators.length === 0 ? (
                    <span className="text-xs font-bold text-[#AFAFAF] italic">No creator assigned</span>
                  ) : course.creators.map((ca: any) => (
                    <span
                      key={ca.creator.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#58CC02]/10 text-[#58CC02] text-xs font-black"
                    >
                      <Pencil className="w-3 h-3" />
                      {ca.creator.firstName} {ca.creator.lastName}
                      <button
                        onClick={() => removeCreator.mutate({ courseId: course.id, creatorUserId: ca.creator.id })}
                        className="ml-1 hover:text-[#FF4B4B] transition-colors"
                        title="Remove creator"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowAssignModal(course.id)}
                  className="p-2.5 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors text-[#AFAFAF] hover:text-[#58CC02]"
                  title="Assign creator"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                {course.status === "DRAFT" && (
                  <button
                    onClick={() => updateStatus.mutate({ courseId: course.id, status: "PUBLISHED" })}
                    className="p-2.5 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors text-[#AFAFAF] hover:text-[#58CC02]"
                    title="Publish"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}
                {course.status === "PUBLISHED" && (
                  <button
                    onClick={() => updateStatus.mutate({ courseId: course.id, status: "DRAFT" })}
                    className="p-2.5 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors text-[#AFAFAF] hover:text-[#FFC800]"
                    title="Unpublish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-[#4B4B4B] mb-6">Create Course</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createCourse.mutate({
                  title: fd.get("title") as string,
                  slug: fd.get("slug") as string,
                  subtitle: fd.get("subtitle") as string,
                  description: fd.get("description") as string,
                  category: fd.get("category") as string,
                  difficulty: fd.get("difficulty") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Title</label>
                <input name="title" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Slug</label>
                <input name="slug" required placeholder="intro-to-math" className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none placeholder:text-[#AFAFAF]" />
              </div>
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Subtitle</label>
                <input name="subtitle" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Description</label>
                <textarea name="description" required rows={3} className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Category</label>
                  <input name="category" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide block mb-1">Difficulty</label>
                  <select name="difficulty" required className="w-full bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#E5E5E5] font-black text-[#AFAFAF] text-sm hover:bg-[#F7F7F7] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={createCourse.isPending} className="flex-1 duo-button-primary py-3 text-sm">
                  {createCourse.isPending ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Creator Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowAssignModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-[#4B4B4B] mb-6">Assign Creator</h2>
            {creatorsData?.users.length === 0 ? (
              <p className="text-[#AFAFAF] font-bold text-sm">No course creators available. Create one first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {creatorsData?.users.map((creator: any) => (
                  <button
                    key={creator.id}
                    onClick={() => assignCreator.mutate({ courseId: showAssignModal, creatorUserId: creator.id })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-[#E5E5E5] hover:bg-[#F7F7F7] hover:border-primary transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#58CC02]/10 flex items-center justify-center">
                      <Pencil className="w-5 h-5 text-[#58CC02]" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#4B4B4B]">{creator.firstName} {creator.lastName}</p>
                      <p className="text-xs font-bold text-[#AFAFAF]">{creator.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowAssignModal(null)} className="w-full mt-4 py-3 rounded-xl border-2 border-[#E5E5E5] font-black text-[#AFAFAF] text-sm hover:bg-[#F7F7F7] transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <RoleGuard allowed={["ADMIN", "DEVELOPER"]}>
      <CoursesContent />
    </RoleGuard>
  );
}
