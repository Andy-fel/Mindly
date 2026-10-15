import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import EmergencyMode from './canales_Atencion';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('EmergencyMode - S.O.S Integration Test', () => {
  it('should open the confirmation modal and call onCallEmergency when confirmed', async () => {
    const onCallEmergencyMock = vi.fn();

    render(
      <BrowserRouter>
        <EmergencyMode onCallEmergency={onCallEmergencyMock} />
      </BrowserRouter>
    );

    // 1. Buscar el botón de emergencias
    const emergencyButton = screen.getByText(/Llamar a Emergencias \(Línea 106\)/i);
    
    // 2. Hacer click
    fireEvent.click(emergencyButton);

    // 3. Verificar que el modal se abre mostrando el título correspondiente
    const modalTitle = screen.getByText('¿Llamar a Emergencias?');
    expect(modalTitle).toBeInTheDocument();

    // 4. Buscar y hacer click en el botón de confirmación ("Sí, llamar ahora")
    const confirmButton = screen.getByRole('button', { name: /Sí, llamar ahora/i });
    fireEvent.click(confirmButton);

    // 5. Verificar que se cerró el modal y se ejecutó la función
    await waitFor(() => {
      expect(onCallEmergencyMock).toHaveBeenCalledTimes(1);
    });
    
    // Verificamos que el modal ya no está (al buscar el texto y esperar null)
    expect(screen.queryByText('¿Llamar a Emergencias?')).not.toBeInTheDocument();
  });
});
