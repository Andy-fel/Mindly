import { useState, useEffect } from 'react';

export const useEmergencyLogic = () => {
    // Control del Estado del Sidebar Drawer
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Bloquear scroll del body si el menú está desplegado
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    // Lógica e interacción del texto de respiración autónoma
    const [breathText, setBreathText] = useState('Inhala');
    const [breathOpacity, setBreathOpacity] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setBreathOpacity(0);
            setTimeout(() => {
                setBreathText((prev) => (prev === 'Inhala' ? 'Exhala' : 'Inhala'));
                setBreathOpacity(1);
            }, 1000);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Control de microinteracción de escala al hacer click/tap (Active State)
    const [activeElement, setActiveElement] = useState(null);

    const handleMouseDown = (id) => setActiveElement(id);
    const handleMouseUpOrLeave = () => setActiveElement(null);

    const getScaleClass = (id) => activeElement === id ? 'scale-active' : '';

    return {
        isSidebarOpen,
        toggleSidebar,
        breathText,
        breathOpacity,
        handleMouseDown,
        handleMouseUpOrLeave,
        getScaleClass
    };
};