import React from 'react';
import {Exame} from '../../types/Exame.ts';
import {Button, IconButton} from '@mui/material';
import {ArrowForwardIos, InsertPhoto, KeyboardArrowDown} from '@mui/icons-material';

interface ExameListProps {
  exames: Exame[];
  onSelect: (id: string) => void;
  usuario: string;
}

const ExameList: React.FC<ExameListProps> = ({ exames, onSelect, usuario }) => {
  return (
    <div className="exame-list ml-2 md:ml-6"> {/* Ajustando margem para dispositivos móveis */}
      <h2 className="font-bold text-xl md:text-2xl mb-2 text-oxfordBlue font-sans">Resultado de Procedimentos</h2>

      {/* Informação do usuário logado */}
      <div className="flex items-center mb-6 bg-gray-100 px-4 py-2 rounded-full inline-block">
        <p className="font-semibold text-black mr-2">{usuario}</p>
        <span className="text-gray-400 mr-2">•</span>
        <button className="text-oxfordBlue hover:underline">Alterar</button>
        <IconButton size="small">
          <KeyboardArrowDown />
        </IconButton>
      </div>

      {exames.map((exame) => (
        <div
          key={exame.id}
          className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 mb-4 shadow-sm rounded-lg border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
          onClick={() => onSelect(exame.id)}
        >
          {/* Ícone e detalhes do exame */}
          <div className="flex items-center space-x-4">
            <div className="bg-skyBlue p-3 rounded-lg">
              <InsertPhoto style={{ fontSize: 30, color: '#fff' }} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-oxfordBlue">{exame.nome}</h3>
              <p className="text-sm text-gray-500">Procedimentos Laboratoriais</p>
              <p className="text-sm text-gray-400">{exame.data} · {exame.horario}</p>
            </div>
          </div>

          {/* Botões à direita em telas maiores, empilhados em telas menores */}
          <div className="flex md:flex-row flex-col items-start md:items-center space-y-2 md:space-y-0 space-x-0 md:space-x-4 mt-4 md:mt-0">
            <Button
              variant="outlined"
              style={{ color: '#05D2FF', borderColor: '#05D2FF' }}
              size="small"
              className="text-sm font-medium"
            >
              Compartilhar
            </Button>
            <IconButton>
              <ArrowForwardIos style={{ color: '#05D2FF' }} />
            </IconButton>
          </div>
        </div>
      ))}

      <h3 className="font-bold text-xl mt-8 text-oxfordBlue">Procedimentos Agendados</h3>
      <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">
          Não encontrei procedimentos agendados para você ainda.
        </p>
        <Button variant="contained" style={{ backgroundColor: '#05D2FF' }} className="mt-4 text-sm font-medium">
          Agendar Procedimentos
        </Button>
      </div>
    </div>
  );
};

export default ExameList;
