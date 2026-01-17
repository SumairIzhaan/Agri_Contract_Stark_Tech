import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                await fetchRole(session.user.id)
            }
            setLoading(false)
        }

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user)
                await fetchRole(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setRole(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchRole = async (userId) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()
            setRole(data?.role || null)
            return data?.role || null
        } catch {
            setRole(null)
            return null
        }
    }

    const signUp = async ({ email, password, role, name, phone }) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) return { data: null, error }

        await supabase.from('profiles').insert({
            id: data.user.id,
            role,
            name,
            phone,
            email
        })
        return { data, error: null }
    }

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { data: null, error }

        setUser(data.user)
        const userRole = await fetchRole(data.user.id)
        return { data, role: userRole, error: null }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Supabase signOut error:", error)
        } finally {
            setUser(null)
            setRole(null)
            localStorage.clear()
        }
    }

    return (
        <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
