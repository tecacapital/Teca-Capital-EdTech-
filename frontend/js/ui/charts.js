/**
 * charts.js — Wrapper Apache ECharts (COMPLETO)
 * Teca Capital EdTech
 * 
 * Responsabilidade: Inicializar, atualizar e gerenciar gráficos
 * usando Apache ECharts com suporte a todos os tipos.
 */

let echartsLoaded = false;
let echarts = null;

async function loadECharts() {
  if (echartsLoaded) return echarts;
  
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    
    echarts = window.echarts;
    echartsLoaded = true;
    return echarts;
  } catch (error) {
    console.error('Erro ao carregar ECharts:', error);
    return null;
  }
}

class Charts {
  constructor() {
    this.charts = {};
    this.echarts = null;
    this._resizeObservers = {};
  }

  /**
   * Inicializa a biblioteca ECharts
   */
  async init() {
    this.echarts = await loadECharts();
    return !!this.echarts;
  }

  /**
   * Cria um gráfico de linha
   */
  criarGraficoLinha(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'linha', dados, options);
  }

  /**
   * Cria um gráfico de candlestick
   */
  criarGraficoCandlestick(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'candlestick', dados, options);
  }

  /**
   * Cria um gráfico de barras
   */
  criarGraficoBarras(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'barra', dados, options);
  }

  /**
   * Cria um gráfico de pizza
   */
  criarGraficoPizza(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'pizza', dados, options);
  }

  /**
   * Cria um gráfico de radar
   */
  criarGraficoRadar(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'radar', dados, options);
  }

  /**
   * Cria um gráfico de comparação (múltiplas linhas)
   */
  criarGraficoComparacao(containerId, dados, options = {}) {
    return this._criarGrafico(containerId, 'comparacao', dados, options);
  }

  /**
   * Atualiza um gráfico existente
   */
  atualizar(containerId, dados, options = {}) {
    const chart = this.charts[containerId];
    if (!chart) {
      // Se não existe, criar um novo
      return this._criarGrafico(containerId, 'linha', dados, options);
    }

    const option = this._buildOption(dados, options);
    chart.setOption(option, true);
    return chart;
  }

  /**
   * Redimensiona um gráfico
   */
  redimensionar(containerId) {
    const chart = this.charts[containerId];
    if (chart) {
      chart.resize();
    }
  }

  /**
   * Redimensiona todos os gráficos
   */
  redimensionarTodos() {
    for (const id in this.charts) {
      this.charts[id].resize();
    }
  }

  /**
   * Remove um gráfico
   */
  remover(containerId) {
    const chart = this.charts[containerId];
    if (chart) {
      if (this._resizeObservers[containerId]) {
        this._resizeObservers[containerId].disconnect();
        delete this._resizeObservers[containerId];
      }
      chart.dispose();
      delete this.charts[containerId];
    }
  }

  /**
   * Cria um gráfico interno
   */
  _criarGrafico(containerId, tipo, dados, options) {
    if (!this.echarts) return null;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} não encontrado`);
      return null;
    }

    // Se já existe, remover
    if (this.charts[containerId]) {
      this.remover(containerId);
    }

    const chart = this.echarts.init(container);
    this.charts[containerId] = chart;

    const option = this._buildOption(dados, { ...options, tipo });
    chart.setOption(option);

    // Responsividade
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);
    this._resizeObservers[containerId] = resizeObserver;

    return chart;
  }

  /**
   * Constrói a opção do gráfico
   */
  _buildOption(dados, options) {
    const { tipo = 'linha', titulo = '', tema = 'dark' } = options;

    const isDark = tema === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const axisColor = isDark ? '#333333' : '#E0E0E0';
    const gridColor = isDark ? '#1A1A1A' : '#F5F5F5';
    const tooltipBg = isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
    const tooltipText = isDark ? '#FFFFFF' : '#1A1A1A';

    const baseOption = {
      title: titulo ? {
        text: titulo,
        textStyle: { color: textColor, fontSize: 14 },
        left: 'center',
      } : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: 'rgba(214,174,100,0.3)',
        textStyle: { color: tooltipText },
        formatter: options.tooltipFormatter || undefined,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      legend: {
        textStyle: { color: '#B0B0B0' },
        ...options.legend,
      },
      color: ['#D6AE64', '#4CAF50', '#FF5252', '#2196F3', '#FF9800', '#9C27B0'],
    };

    switch (tipo) {
      case 'linha':
        return this._buildOptionLinha(dados, baseOption, options);
      case 'comparacao':
        return this._buildOptionComparacao(dados, baseOption, options);
      case 'candlestick':
        return this._buildOptionCandlestick(dados, baseOption, options);
      case 'barra':
        return this._buildOptionBarra(dados, baseOption, options);
      case 'pizza':
        return this._buildOptionPizza(dados, baseOption, options);
      case 'radar':
        return this._buildOptionRadar(dados, baseOption, options);
      default:
        return baseOption;
    }
  }

  _buildOptionLinha(dados, base, options) {
    return {
      ...base,
      xAxis: {
        type: 'category',
        data: dados.categorias || [],
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#B0B0B0' },
        ...options.xAxis,
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1A1A1A' } },
        axisLabel: { color: '#B0B0B0' },
        ...options.yAxis,
      },
      series: dados.series.map(s => ({
        type: 'line',
        name: s.nome,
        data: s.dados,
        smooth: options.smooth !== false,
        lineStyle: { color: s.cor || '#D6AE64', width: 2 },
        itemStyle: { color: s.cor || '#D6AE64' },
        areaStyle: options.area ? { color: 'rgba(214,174,100,0.15)' } : undefined,
        symbol: options.symbol || 'circle',
        symbolSize: options.symbolSize || 4,
        ...s,
      })),
    };
  }

  _buildOptionComparacao(dados, base, options) {
    const cores = ['#D6AE64', '#4CAF50', '#FF5252', '#2196F3', '#FF9800'];
    return {
      ...base,
      xAxis: {
        type: 'category',
        data: dados.categorias || [],
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#B0B0B0' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1A1A1A' } },
        axisLabel: { color: '#B0B0B0' },
      },
      series: dados.series.map((s, index) => ({
        type: 'line',
        name: s.nome,
        data: s.dados,
        smooth: true,
        lineStyle: { color: cores[index % cores.length], width: 2 },
        itemStyle: { color: cores[index % cores.length] },
        symbol: 'circle',
        symbolSize: 4,
        ...s,
      })),
    };
  }

  _buildOptionCandlestick(dados, base, options) {
    return {
      ...base,
      xAxis: {
        type: 'category',
        data: dados.categorias || [],
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#B0B0B0' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1A1A1A' } },
        axisLabel: { color: '#B0B0B0' },
      },
      series: [{
        type: 'candlestick',
        data: dados.series[0]?.dados || [],
        itemStyle: {
          color: '#4CAF50',
          color0: '#FF5252',
          borderColor: '#4CAF50',
          borderColor0: '#FF5252',
        },
        ...options.series,
      }],
    };
  }

  _buildOptionBarra(dados, base, options) {
    return {
      ...base,
      xAxis: {
        type: 'category',
        data: dados.categorias || [],
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#B0B0B0' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1A1A1A' } },
        axisLabel: { color: '#B0B0B0' },
      },
      series: dados.series.map(s => ({
        type: 'bar',
        name: s.nome,
        data: s.dados,
        itemStyle: { 
          color: s.cor || '#D6AE64', 
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: options.barWidth || '40%',
        ...s,
      })),
    };
  }

  _buildOptionPizza(dados, base, options) {
    return {
      ...base,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderColor: 'rgba(214,174,100,0.3)',
        textStyle: { color: '#FFFFFF' },
        formatter: '{b}: {c} ({d}%)',
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: dados.series[0]?.dados || [],
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0A0A0A',
          borderWidth: 2,
        },
        label: {
          color: '#B0B0B0',
          fontSize: 12,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: { color: '#333' },
        },
        ...options.series,
      }],
    };
  }

  _buildOptionRadar(dados, base, options) {
    return {
      ...base,
      radar: {
        indicator: dados.categorias?.map(c => ({ 
          name: c, 
          max: options.max || 100 
        })) || [],
        axisName: { color: '#B0B0B0' },
        splitArea: {
          areaStyle: { color: ['rgba(214,174,100,0.02)', 'rgba(214,174,100,0.04)'] },
        },
        axisLine: { lineStyle: { color: '#333' } },
        ...options.radar,
      },
      series: dados.series.map(s => ({
        type: 'radar',
        name: s.nome,
        data: [{ value: s.dados, name: s.nome }],
        lineStyle: { color: s.cor || '#D6AE64', width: 2 },
        areaStyle: { color: 'rgba(214,174,100,0.15)' },
        ...s,
      })),
    };
  }
}

// Instância única
export const charts = new Charts();