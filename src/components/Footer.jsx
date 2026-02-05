import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container py-8">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            <span className="text-xl"></span> <strong>Camina Segura</strong> · Catalunya
          </p>
          <p className="text-sm">
            Proyecto basado en datos abiertos · {' '}
            <a 
              href="https://analisi.transparenciacatalunya.cat/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Portal Transparència
            </a>
            {' · '}
            <a 
              href="https://opendata-ajuntament.barcelona.cat/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Open Data BCN
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
