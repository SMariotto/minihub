export function calcularMetaDiaria(trofeusAtuais, trofeusObjetivo, diasRestantes) {
  if (diasRestantes <= 0) {
    return 0;
  }
  
  const trofeusFaltantes = trofeusObjetivo - trofeusAtuais;
  
  if (trofeusFaltantes <= 0) {
    return 0;
  }
  
  return Math.ceil(trofeusFaltantes / diasRestantes);
}

export function converterDataEmDias(dataFinal) {
  const dataAtual = new Date();
  const dataMeta = new Date(dataFinal);
  
  const diferencaEmMilissegundos = dataMeta - dataAtual;
  
  if (diferencaEmMilissegundos <= 0) {
    return 0;
  }
  
  return Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
}