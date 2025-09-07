import React from 'react'
import Dashboard from '../admin/Dashboard'
import { AdminRoute } from '~~/components/AdminRoute'

const page = () => {
    return (
        <AdminRoute>
            <Dashboard />
        </AdminRoute>
    )
}

export default page