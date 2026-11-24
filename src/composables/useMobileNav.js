import { ref } from 'vue'

// Shared state for the off-canvas sidebar on small screens
const isNavOpen = ref(false)

export function useMobileNav() {
  const openNav = () => { isNavOpen.value = true }
  const closeNav = () => { isNavOpen.value = false }
  const toggleNav = () => { isNavOpen.value = !isNavOpen.value }
  return { isNavOpen, openNav, closeNav, toggleNav }
}
