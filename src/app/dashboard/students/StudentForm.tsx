'use client'

import { OperationData } from '@ts-gql/tag/no-transform'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ErrorPop from 'components/ErrorPop'
import SuccessPop from 'components/SuccessPop'
import Datepicker from 'react-tailwindcss-datepicker'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DropDown from 'components/DropDown'
import { GET_STUDENT_BY_ID } from 'app/dashboard/students/queries'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import { createStudent, updateStudent } from 'keystone/context/students'

type Values = {
  firstName: string
  surname: string
  dateOfBirth: string
  school: string
  yearLevel: number
  medical: string
}

const studentSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Please enter Student's first name" }),
  surname: z.string().min(1, { message: "Please enter Student's surname" }),
  dateOfBirth: z
    .string()
    .min(1, { message: "Please enter Student's date of birth" }),
  school: z.string().regex(/SCHOOL|HOME|OTHER/, {
    message: 'Please select a schooling type',
  }),
  yearLevel: z
    .number()
    .min(0, {
      message: "Please enter Student's year level - use 0 for Prep",
    })
    .max(13, {
      message: 'Please enter a valid year level - Enter 13 for out of school',
    }),
  medical: z.string().optional(),
})

export default function Student({
  student,
  accountId,
}: {
  student?: OperationData<typeof GET_STUDENT_BY_ID>['student']
  accountId: string
}) {
  const router = useRouter()
  const defaultValues = {
    firstName: student?.firstName || '',
    surname: student?.surname || '',
    dateOfBirth: student?.dateOfBirth || '2020-01-01',
    school: student?.school || 'SCHOOL',
    yearLevel: student?.yearLevel || 0,
    medical: student?.medical || '',
  }
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [isDone, setDone] = useState<boolean>(false)
  const [dob, setDob] = useState<string>('2020-01-01')
  const [isSubmitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(studentSchema) })
  const onSubmit = async (values: Values) => {
    setSubmitting(true)
    const data = {
      ...values,
      account: { connect: { id: accountId } },
    }
    try {
      if (!student) {
        const newStudent = await createStudent({ data })
        if (!newStudent?.createStudent?.id) {
          setError(true)
          throw new Error('Student not created')
        }

        setSuccess(true)
        setDone(true)
        setSubmitting(false)
        router.push(`/dashboard/students/${newStudent.createStudent.id}`)
      } else {
        await updateStudent({
          id: student.id,
          data: values,
        })

        setSuccess(true)
        setSubmitting(false)
        router.refresh()
      }
    } catch (error) {
      setError(true)
      setSubmitting(false)
      throw error
    }
  }

  return (
    <>
      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Student Information
              </h3>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  First name
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    title="First Name"
                    {...register('firstName')}
                    type="text"
                    autoComplete="given-name"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {errors.firstName && (
                    <div className="block text-sm font-medium text-red-700">
                      {errors.firstName.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Surname
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    title="Surname"
                    {...register('surname')}
                    type="text"
                    autoComplete="family-name"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {errors.surname && (
                    <div className="block text-sm font-medium text-red-700">
                      {errors.surname.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Date of Birth
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <Datepicker
                    value={{
                      startDate: dob,
                      endDate: dob,
                    }}
                    onChange={(dates) => {
                      if (!dates || !dates.startDate) return
                      dayjs.extend(customParseFormat)
                      const value = dayjs(dates.startDate, 'YYYY-M-D').format(
                        'YYYY-MM-DD',
                      )
                      setDob(value)
                      setValue('dateOfBirth', value)
                    }}
                    asSingle={true}
                    useRange={false}
                    displayFormat={'DD/MM/YYYY'}
                    containerClassName="relative w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {errors.dateOfBirth && (
                    <div className="block text-sm font-medium text-red-700">
                      {errors.dateOfBirth.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="yearLevel"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Year Level - Enter 0 for Prep
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    title="Year Level"
                    {...register('yearLevel', { valueAsNumber: true })}
                    type="number"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {errors.yearLevel && (
                    <div className="block text-sm font-medium text-red-700">
                      {errors.yearLevel.message}
                    </div>
                  )}
                </div>
              </div>

              <Controller
                control={control}
                name="school"
                render={({ field: { onChange, value, name } }) => (
                  <DropDown
                    label="Education Type"
                    options={[
                      { id: 1, label: 'School', value: 'SCHOOL' },
                      { id: 2, label: 'Home Educated', value: 'HOME' },
                      { id: 3, label: 'Other', value: 'OTHER' },
                    ]}
                    value={value}
                    handleChange={onChange}
                    name={name}
                  />
                )}
              />

              <div>
                <label
                  htmlFor="medical"
                  className="block text-sm font-medium text-gray-700"
                >
                  Any relivate medical information including action required in
                  an emergency
                </label>
                <div className="mt-1">
                  <textarea
                    rows={4}
                    title="Medical Information"
                    {...register('medical')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                {errors.medical && (
                  <div className="block text-sm font-medium text-red-700">
                    {errors.medical.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            {student && (
              <div className="absolute right-1/3 flex px-8">
                <ArrowDownIcon height={20} />
                <p>Scroll Down for Enrollment details</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                router.push('/dashboard/students')
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDone}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isSubmitting || isDone
                ? 'Loading...'
                : !student
                ? 'Add'
                : 'Save'}
            </button>
          </div>
        </div>
      </form>
      <ErrorPop error={error} setError={setError} />
      <SuccessPop success={success} setSuccess={setSuccess} />
    </>
  )
}
