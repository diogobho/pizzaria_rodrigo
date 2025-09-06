import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { X, ArrowLeft, ArrowRight, Pizza } from 'lucide-react';
import { PizzaOrder, PizzaExtra } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface PizzaBuilderProps {
  onClose: () => void;
  onAddToOrder: (pizza: PizzaOrder) => void;
}

const PizzaBuilder: React.FC<PizzaBuilderProps> = ({ onClose, onAddToOrder }) => {
  const { state } = useApp();
  const [step, setStep] = useState<'format' | 'size' | 'flavors' | 'border' | 'extras' | 'summary'>('format');
  const [format, setFormat] = useState<'inteira' | 'meia-meia' | null>(null);
  const [size, setSize] = useState<'media' | 'grande'>('grande');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'tradicional' | 'premium' | 'especial'>('tradicional');
  const [border, setBorder] = useState<string | null>(null);
  const [extras, setExtras] = useState<PizzaExtra[]>([]);
  const [quantity, setQuantity] = useState(1);

  const availableExtras = [
    { name: 'Bacon', price: 4.00 },
    { name: 'Cream Cheese', price: 3.00 },
    { name: 'Azeitona', price: 2.00 },
    { name: 'Champignon', price: 3.00 },
    { name: 'Cebola Roxa', price: 2.00 },
    { name: 'Palmito', price: 4.00 },
  ];

  const getBorderPrice = (borderType: string, category: string) => {
    switch (borderType) {
      case 'requeijao':
        return category === 'premium' || category === 'especial' ? 0 : 3.00;
      case 'catupiry':
      case 'cheddar':
        if (category === 'especial') return 0;
        if (category === 'premium') return 5.00;
        return 8.00;
      case 'chocolate':
        return 6.00;
      default:
        return 0;
    }
  };

  const calculatePrice = () => {
    if (!format || selectedFlavors.length === 0) return 0;

    const flavorPrices = selectedFlavors.map(flavorId => {
      const flavor = state.pizzaFlavors.find(f => f.id === flavorId);
      return flavor ? flavor.price : 0;
    });
    
    let basePrice = Math.max(...flavorPrices);
    
    if (size === 'media') {
      basePrice *= 0.8;
    }

    const highestCategory = selectedFlavors.reduce((highest, flavorId) => {
      const flavor = state.pizzaFlavors.find(f => f.id === flavorId);
      if (!flavor) return highest;
      
      const categoryOrder = { tradicional: 1, premium: 2, especial: 3 };
      return categoryOrder[flavor.category] > categoryOrder[highest] ? flavor.category : highest;
    }, 'tradicional' as 'tradicional' | 'premium' | 'especial');

    const borderPrice = border ? getBorderPrice(border, highestCategory) : 0;
    const extrasPrice = extras.reduce((total, extra) => total + extra.price, 0);

    return (basePrice + borderPrice + extrasPrice) * quantity;
  };

  const handleNext = () => {
    switch (step) {
      case 'format':
        if (format) setStep('size');
        break;
      case 'size':
        setStep('flavors');
        break;
      case 'flavors':
        if (selectedFlavors.length > 0 && 
            (format === 'inteira' ? selectedFlavors.length === 1 : selectedFlavors.length === 2)) {
          setStep('border');
        }
        break;
      case 'border':
        setStep('extras');
        break;
      case 'extras':
        setStep('summary');
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'size':
        setStep('format');
        break;
      case 'flavors':
        setStep('size');
        break;
      case 'border':
        setStep('flavors');
        break;
      case 'extras':
        setStep('border');
        break;
      case 'summary':
        setStep('extras');
        break;
    }
  };

  const handleFlavorSelect = (flavorId: string) => {
    if (format === 'inteira') {
      setSelectedFlavors([flavorId]);
    } else {
      if (selectedFlavors.includes(flavorId)) {
        setSelectedFlavors(selectedFlavors.filter(id => id !== flavorId));
      } else if (selectedFlavors.length < 2) {
        setSelectedFlavors([...selectedFlavors, flavorId]);
      }
    }
  };

  const handleExtraToggle = (extraName: string, extraPrice: number, location: 'toda' | 'metade1' | 'metade2') => {
    const existingExtra = extras.find(e => e.name === extraName && e.location === location);
    
    if (existingExtra) {
      setExtras(extras.filter(e => !(e.name === extraName && e.location === location)));
    } else {
      setExtras([...extras, { name: extraName, price: extraPrice, location }]);
    }
  };

  const handleFinalize = () => {
    const flavorNames = selectedFlavors.map(id => {
      const flavor = state.pizzaFlavors.find(f => f.id === id);
      return flavor ? flavor.name : '';
    });

    const pizzaOrder: PizzaOrder = {
      id: uuidv4(),
      format: format!,
      flavors: flavorNames,
      border: border as any,
      extras,
      size,
      quantity,
      totalPrice: calculatePrice(),
    };

    onAddToOrder(pizzaOrder);
  };

  const stepTitles = {
    format: 'Formato',
    size: 'Tamanho',
    flavors: 'Sabores',
    border: 'Borda',
    extras: 'Extras',
    summary: 'Resumo'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Pizza className="w-6 h-6 mr-2 text-red-600" />
            Montar Pizza - {stepTitles[step]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'format' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Como você quer sua pizza?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat('inteira')}
                  className={`p-6 border-2 rounded-xl text-center transition-all ${
                    format === 'inteira'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="text-xl font-bold mb-2">Pizza Inteira</h4>
                  <p className="text-gray-600">Um sabor para toda a pizza</p>
                </button>
                <button
                  onClick={() => setFormat('meia-meia')}
                  className={`p-6 border-2 rounded-xl text-center transition-all ${
                    format === 'meia-meia'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="text-xl font-bold mb-2">Meia a Meia</h4>
                  <p className="text-gray-600">Dois sabores diferentes</p>
                </button>
              </div>
            </div>
          )}

          {step === 'size' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Escolha o tamanho:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSize('media')}
                  className={`p-6 border-2 rounded-xl text-center transition-all ${
                    size === 'media'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="text-xl font-bold mb-2">Média</h4>
                  <p className="text-gray-600">6 fatias • Ideal para 2-3 pessoas</p>
                  <p className="text-lg font-bold text-red-600 mt-2">20% de desconto</p>
                </button>
                <button
                  onClick={() => setSize('grande')}
                  className={`p-6 border-2 rounded-xl text-center transition-all ${
                    size === 'grande'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="text-xl font-bold mb-2">Grande</h4>
                  <p className="text-gray-600">8 fatias • Ideal para 4-5 pessoas</p>
                  <p className="text-lg font-bold text-red-600 mt-2">Preço normal</p>
                </button>
              </div>
            </div>
          )}

          {step === 'flavors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Escolha {format === 'inteira' ? '1 sabor' : '2 sabores'}:
              </h3>
              
              <div className="flex space-x-2 mb-4">
                {(['tradicional', 'premium', 'especial'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      selectedCategory === category
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {state.pizzaFlavors
                  .filter(flavor => flavor.category === selectedCategory)
                  .map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => handleFlavorSelect(flavor.id)}
                    disabled={!selectedFlavors.includes(flavor.id) && 
                             ((format === 'inteira' && selectedFlavors.length >= 1) ||
                              (format === 'meia-meia' && selectedFlavors.length >= 2))}
                    className={`p-3 border-2 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedFlavors.includes(flavor.id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-sm">{flavor.name}</h4>
                    <p className="text-xs text-red-600">R$ {flavor.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'border' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Escolha a borda:</h3>
              
              {(() => {
                const highestCategory = selectedFlavors.reduce((highest, flavorId) => {
                  const flavor = state.pizzaFlavors.find(f => f.id === flavorId);
                  if (!flavor) return highest;
                  
                  const categoryOrder = { tradicional: 1, premium: 2, especial: 3 };
                  return categoryOrder[flavor.category] > categoryOrder[highest] ? flavor.category : highest;
                }, 'tradicional' as 'tradicional' | 'premium' | 'especial');

                const borderOptions = [
                  { id: null, name: 'Sem borda', price: 0 },
                  { id: 'requeijao', name: 'Requeijão', price: getBorderPrice('requeijao', highestCategory) },
                  { id: 'catupiry', name: 'Catupiry', price: getBorderPrice('catupiry', highestCategory) },
                  { id: 'cheddar', name: 'Cheddar', price: getBorderPrice('cheddar', highestCategory) },
                  { id: 'chocolate', name: 'Chocolate', price: getBorderPrice('chocolate', highestCategory) },
                ];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {borderOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setBorder(option.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          border === option.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-red-600">
                          {option.price === 0 ? 'Grátis' : `+R$ ${option.price.toFixed(2)}`}
                        </p>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {step === 'extras' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Ingredientes extras:</h3>
              
              <div className="space-y-3">
                {availableExtras.map((extra) => (
                  <div key={extra.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{extra.name}</h4>
                      <p className="text-red-600 font-medium">+R$ {extra.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExtraToggle(extra.name, extra.price, 'toda')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          extras.some(e => e.name === extra.name && e.location === 'toda')
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Toda
                      </button>
                      
                      {format === 'meia-meia' && (
                        <>
                          <button
                            onClick={() => handleExtraToggle(extra.name, extra.price, 'metade1')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              extras.some(e => e.name === extra.name && e.location === 'metade1')
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Metade 1
                          </button>
                          <button
                            onClick={() => handleExtraToggle(extra.name, extra.price, 'metade2')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              extras.some(e => e.name === extra.name && e.location === 'metade2')
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Metade 2
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Resumo do Pedido:</h3>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-4">
                  Pizza {size === 'media' ? 'Média' : 'Grande'} {format === 'inteira' ? 'Inteira' : 'Meia-Meia'}
                </h4>
                
                <div className="space-y-2 text-gray-700">
                  <p><strong>Sabores:</strong> {selectedFlavors.map(id => {
                    const flavor = state.pizzaFlavors.find(f => f.id === id);
                    return flavor ? flavor.name : '';
                  }).join(' / ')}</p>
                  
                  {border && (
                    <p><strong>Borda:</strong> {border.charAt(0).toUpperCase() + border.slice(1)}</p>
                  )}
                  
                  {extras.length > 0 && (
                    <p><strong>Extras:</strong> {extras.map(e => `${e.name} (${e.location})`).join(', ')}</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Preço unitário:</span>
                    <span className="text-2xl font-bold text-red-600">
                      R$ {(calculatePrice() / quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quantidade:</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
                    <span className="text-xl font-bold">TOTAL:</span>
                    <span className="text-2xl font-bold text-red-600">
                      R$ {calculatePrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div>
            {step !== 'format' && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">
              Total: R$ {calculatePrice().toFixed(2)}
            </p>
          </div>
          
          <div>
            {step === 'summary' ? (
              <button
                onClick={handleFinalize}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center"
              >
                Adicionar ao Pedido
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={
                  (step === 'format' && !format) ||
                  (step === 'flavors' && (
                    selectedFlavors.length === 0 ||
                    (format === 'inteira' && selectedFlavors.length !== 1) ||
                    (format === 'meia-meia' && selectedFlavors.length !== 2)
                  ))
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaBuilder;
