"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  esJefe: boolean;
  esAdmin: boolean;
  esTecnico: boolean;
};

export function MobileMenu({ esJefe, esAdmin, esTecnico }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white p-2"
        aria-label="Menú"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: 'linear-gradient(135deg, #0024FF 0%, #0017b3 100%)',
          overflowY: 'auto',
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <img src="/mechsuite_logo.svg" alt="MechSuite" className="h-8" />
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            <Link
              href="/equipos"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
            >
              Equipos
            </Link>
            <Link
              href="/ordenes"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
            >
              Órdenes de Trabajo
            </Link>
            {(esJefe || esAdmin) && (
              <>
                <Link
                  href="/clientes"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Clientes
                </Link>
                <Link
                  href="/usuarios"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Usuarios
                </Link>
                <Link
                  href="/indicadores"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Indicadores
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
