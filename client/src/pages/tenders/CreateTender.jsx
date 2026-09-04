import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const initialForm = {
  referenceNo: '',
  title: '',
  clientName: '',
  description: '',
  status: 'DRAFT',
  priority: 'MEDIUM',
  progress: 0,
  startDate: '',
  deadline: '',
}

const CreateTender = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const tenderListPath =
    user?.role === 'ADMIN'
      ? '/admin/tenders'
      : '/manager/tenders'

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!form.referenceNo.trim()) {
      setError('Tender reference number is required.')
      return
    }

    if (!form.title.trim()) {
      setError('Tender title is required.')
      return
    }

    if (
      form.startDate &&
      form.deadline &&
      form.deadline < form.startDate
    ) {
      setError('Deadline cannot be earlier than start date.')
      return
    }

    try {
      setSubmitting(true)

      await api.post('/tenders', {
        referenceNo: form.referenceNo.trim(),
        title: form.title.trim(),
        clientName: form.clientName.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        progress: Number(form.progress),
        startDate: form.startDate || null,
        deadline: form.deadline || null,
      })

      navigate(tenderListPath, {
        replace: true,
        state: {
          message: 'Tender created successfully.',
        },
      })
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to create tender. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate(tenderListPath)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft size={17} />
        Back to Tender Management
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
          Create Tender
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter the tender information before assigning it to an
          employee.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-950">
            Tender Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide the basic details, dates and initial status of the
            tender.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="referenceNo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Reference Number
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="referenceNo"
                name="referenceNo"
                type="text"
                value={form.referenceNo}
                onChange={handleChange}
                placeholder="e.g. EHG-2026-005"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Tender Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter tender title"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="clientName"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Client Name
            </label>

            <input
              id="clientName"
              name="clientName"
              type="text"
              value={form.clientName}
              onChange={handleChange}
              placeholder="Enter client or organization name"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Enter tender scope, requirements or notes..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PREPARATION">
                  Preparation
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="REVIEW">Review</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="progress"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Initial Progress
              </label>

              <div className="relative">
                <input
                  id="progress"
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.progress}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Deadline
              </label>

              <input
                id="deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                min={form.startDate || undefined}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate(tenderListPath)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {submitting
              ? 'Creating Tender...'
              : 'Create Tender'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTender