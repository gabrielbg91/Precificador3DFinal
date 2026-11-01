import React, { useState } from 'react';

// Função para gerar uma peça vazia com suporte aos novos campos
export const createEmptyPart = () => ({
  name: "",
  description: "",
  printTime: "",
  extraLaborHours: "",
  plates: 1,
  manualAdditionalCosts: "",
  quantityProduced: 1,
  usedFilaments: [{ filamentId: "", grams: "" }],
  usedComponents: [{ componentId: "", quantity: 1 }],
  imageUrl: "",
  fileName: "",
  observations: ""
});

// Componente para redimensionar e converter a foto enviada
export const PartExtraFields = ({ newPart, setNewPart }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 640;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewPart({ ...newPart, imageUrl: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Foto da Peça</label>
        <div className="flex items-center gap-2">
          {newPart.imageUrl ? (
            <div className="relative group">
              <img src={newPart.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
              <button
                type="button"
                onClick={() => setNewPart({ ...newPart, imageUrl: "" })}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg border border-slate-700 transition flex items-center gap-2">
              📷 Escolher Foto
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Ficheiro (.stl / .3mf)</label>
        <input
          type="text"
          placeholder="ex: chaveiro_v2.stl"
          value={newPart.fileName || ""}
          onChange={(e) => setNewPart({ ...newPart, fileName: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Observações</label>
        <textarea
          placeholder="ex: Usar preenchimento 15%..."
          value={newPart.observations || ""}
          onChange={(e) => setNewPart({ ...newPart, observations: e.target.value })}
          rows={1}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

// Componente para exibir na tabela e abrir a Página Dedicada Completa
export const PartInfo = ({ part, filaments = [], components = [] }) => {
  const [isPageOpen, setIsPageOpen] = useState(false);
  const imgSource = part.imageUrl || part.image || "";

  // Função robusta para encontrar o nome real do filamento
  const getFilamentName = (fil) => {
    if (fil.filamentName) return fil.filamentName;
    const targetId = fil.filamentId || fil.id;
    if (!targetId) return 'Filamento';

    const found = filaments.find(f => f.id == targetId || f.filamentId == targetId);
    if (found) {
      return found.name || found.filamentName || found.material || found.title || targetId;
    }
    return targetId;
  };

  // Função robusta para encontrar o nome real do componente extra
  const getComponentName = (comp) => {
    if (comp.componentName) return comp.componentName;
    const targetId = comp.componentId || comp.id;
    if (!targetId) return 'Item Extra';

    const found = components.find(c => c.id == targetId || c.componentId == targetId);
    if (found) {
      return found.name || found.componentName || found.title || targetId;
    }
    return targetId;
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* miniatura com zoom no hover */}
        {imgSource ? (
          <div className="relative group flex-shrink-0 z-10">
            <img
              src={imgSource}
              alt={part.name}
              className="w-12 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer transition-all duration-300 transform group-hover:scale-[3] group-hover:shadow-2xl group-hover:z-50"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
            🖼️
          </div>
        )}

        {/* Informações da Linha */}
        <div className="flex flex-col min-w-0">
          <span
            onClick={() => setIsPageOpen(true)}
            className="font-black text-lg uppercase tracking-tight text-slate-100 hover:text-blue-400 cursor-pointer transition flex items-center gap-2 truncate"
            title="Clique para abrir a página detalhada do projeto"
          >
            {part.name}
            <span className="text-xs bg-blue-950/80 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800 flex-shrink-0">Ver Detalhes ➔</span>
          </span>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {part.fileName && (
              <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                📄 {part.fileName}
              </span>
            )}
            {part.observations && (
              <span className="text-xs text-slate-400 italic truncate max-w-xs" title={part.observations}>
                💬 {part.observations}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* "Página Dedicada" (Overlay Tela Cheia com Tudo Detalhado) */}
      {isPageOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-md flex flex-col overflow-y-auto p-4 md:p-8 animate-fadeIn text-slate-100">
          {/* Barra Superior da "Página" */}
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Detalhes do Projeto
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase text-slate-100">{part.name}</h1>
            </div>
            <button
              onClick={() => setIsPageOpen(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-slate-700"
            >
              ✕ Voltar ao Portfólio
            </button>
          </div>

          {/* Conteúdo Principal da Página */}
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna da Esquerda: Foto Grande, Ficheiro e Dados do Lote */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-center">
                {imgSource ? (
                  <img src={imgSource} alt={part.name} className="w-full h-64 object-cover rounded-xl border border-slate-700 shadow-inner" />
                ) : (
                  <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <span className="text-4xl">🖼️</span>
                    <span className="text-xs">Sem foto cadastrada</span>
                  </div>
                )}
              </div>

              {part.fileName && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ficheiro 3D</span>
                  <span className="font-mono text-sm text-blue-400 bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-900 block truncate">
                    📄 {part.fileName}
                  </span>
                </div>
              )}

              {/* Informações Básicas de Tempo e Lote */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Tempo de Impressão:</span>
                  <span className="font-bold text-slate-100">{part.printTime || "00:00"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Qtd. no Lote:</span>
                  <span className="font-bold text-slate-100">{part.quantityProduced || 1} un.</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Placas:</span>
                  <span className="font-bold text-slate-100">{part.plates || 1}</span>
                </div>
                {part.extraLaborHours && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Mão de Obra Extra:</span>
                    <span className="font-bold text-slate-100">{part.extraLaborHours}h</span>
                  </div>
                )}
                {part.manualAdditionalCosts && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Custos Manuais:</span>
                    <span className="font-bold text-slate-100">R$ {part.manualAdditionalCosts}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna da Direita: Filamentos, Materiais Extras, Descrição e Observações */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Filamentos Usados */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  🧵 Filamentos Usados
                </h3>
                {part.usedFilaments && part.usedFilaments.length > 0 ? (
                  <div className="space-y-2">
                    {part.usedFilaments.map((fil, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-xl flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">
                          {getFilamentName(fil)}
                        </span>
                        <span className="bg-slate-800 text-blue-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                          {fil.grams || 0} g
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum filamento registado.</p>
                )}
              </div>

              {/* Peças e Materiais Extras */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  ⚙️ Peças e Materiais Extras
                </h3>
                {part.usedComponents && part.usedComponents.length > 0 ? (
                  <div className="space-y-2">
                    {part.usedComponents.map((comp, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-xl flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">
                          {getComponentName(comp)}
                        </span>
                        <span className="bg-slate-800 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                          {comp.quantity || 1} un.
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum material extra registado.</p>
                )}
              </div>

              {/* Descrição */}
              {part.description && (
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</h3>
                  <p className="text-sm text-slate-200">{part.description}</p>
                </div>
              )}

              {/* Observações */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações de Impressão</h3>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {part.observations || "Nenhuma observação registada para este projeto."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};