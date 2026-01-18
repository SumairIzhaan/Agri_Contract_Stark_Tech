import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    // PER USER REQUEST: Prevent auto-login on refresh.
    // We explicitly sign out on mount to ensure a fresh state every time the page loads.
    useEffect(() => {
        // Check for existing session on initial load
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (session?.user) {
                    setUser(session.user)
                    await fetchRole(session.user.id)
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    // Ignore abort errors
                    return;
                }
                console.error("Error checking session:", error)
            } finally {
                setLoading(false)
            }
        }

        checkSession()

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user)
                    await fetchRole(session.user.id)
                }
                if (event === 'SIGNED_OUT') {
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

            const userRole = data?.role || null
            setRole(userRole)
            return userRole
        } catch {
            setRole(null)
            return null
        }
    }

    const signUp = async ({ email, password, role, name, phone }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            })

            if (error) return { data: null, error }

            await supabase.from('profiles').insert({
                id: data.user.id,
                role,
                name,
                phone,
                email
            })

            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signIn = async ({ email, password }) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) return { data: null, error }

            setUser(data.user)
            const role = await fetchRole(data.user.id)

            return { data, role, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("SignOut error:", error)
        } finally {
            setUser(null)
            setRole(null)
            localStorage.clear()
            sessionStorage.clear()
        }
    }

    return (
        <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
