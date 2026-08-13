#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars -- 一次性迁移脚本，回调参数存在未使用的情况 */
/**
 * convert-tutorial.mjs
 *
 * Converts easy-vibe VitePress markdown to BolgWeb-compatible MDX.
 * Reads from ../easy-vibe/docs/zh-cn/ → writes to content/tutorial/
 * Images copied to public/tutorial/images/
 *
 * Usage: node scripts/convert-tutorial.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(ROOT, '..', 'easy-vibe', 'docs', 'zh-cn');
const DST_CONTENT = path.resolve(ROOT, 'content', 'tutorial');
const DST_IMAGES = path.resolve(ROOT, 'public', 'tutorial', 'images');

// ─── config ──────────────────────────────────────────────────────────
const CC_LICENSE = 'CC BY-NC-SA 4.0';
const ATTRIBUTION_NAME = 'Datawhale';
const ATTRIBUTION_URL = 'https://github.com/datawhalechina/easy-vibe';
const ORIGIN_BASE = 'https://datawhalechina.github.io/easy-vibe/zh-cn';

// ─── helpers ─────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return 0;
  ensureDir(dst);
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
      count++;
    }
  }
  return count;
}

function fileAge(fpath) {
  try {
    const stat = fs.statSync(fpath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return '2026-06-01';
  }
}

/** Escape < and > inside content that should be raw HTML, not MDX components */
function escapeForMDX(text) {
  // Don't escape if it's already inside a code block (handled separately)
  return text;
}

// ─── stage detection ─────────────────────────────────────────────────

function detectStage(relPath) {
  const parts = relPath.split(path.sep);
  if (parts[0] === 'stage-1') return 1;
  if (parts[0] === 'stage-2') return 2;
  if (parts[0] === 'stage-3') return 3;
  if (parts[0] === 'vibe-stories') return 4;
  if (parts[0] === 'appendix') return 0;
  if (parts[0] === 'guide') return 0;
  return 0;
}

function detectSection(relPath) {
  const parts = relPath.split(path.sep);
  if (['stage-2', 'stage-3'].includes(parts[0])) {
    // stage-2/frontend/xxx or stage-3/cross-platform/xxx
    return parts[1] || '';
  }
  if (parts[0] === 'stage-1') return '';
  if (parts[0] === 'appendix' && parts.length >= 2) {
    // appendix/8-artificial-intelligence/xxx
    return parts[1] || '';
  }
  return '';
}

// ─── admonition conversion (state machine) ───────────────────────────

function convertAdmonitions(content) {
  // Process line by line to handle ::: blocks
  const lines = content.split('\n');
  const out = [];
  let inBlock = false;
  let blockType = '';
  let blockTitle = '';
  let blockLines = [];
  let blockIndent = ''; // track indentation of opening :::

  for (const line of lines) {
    const stripped = line.trimStart();
    const indent = line.slice(0, line.length - stripped.length);

    if (!inBlock) {
      // Check for opening :::
      const m = stripped.match(/^:::(\s*)(info|tip|warning|danger|details)(.*)$/i);
      if (m) {
        inBlock = true;
        blockType = m[2].toLowerCase();
        blockTitle = m[3].trim();
        blockLines = [];
        blockIndent = indent;
        continue;
      }
      out.push(line);
    } else {
      // Check for closing :::
      if (stripped.match(/^:::$/)) {
        inBlock = false;
        out.push(...renderAdmonition(blockType, blockTitle, blockLines));
        continue;
      }
      // Remove the blockIndent from each line if it matches
      const unindented = line.startsWith(blockIndent) ? line.slice(blockIndent.length) : line;
      blockLines.push(unindented);
    }
  }

  // Handle unclosed blocks
  if (inBlock) {
    out.push(...renderAdmonition(blockType, blockTitle, blockLines));
  }

  return out.join('\n');
}

function renderAdmonition(type, title, lines) {
  const cssClass = `admonition admonition-${type}`;
  if (type === 'details') {
    const summary = title || 'Details';
    const body = lines.join('\n');
    return [
      `<details class="${cssClass}">`,
      `<summary>${summary}</summary>`,
      '',
      body,
      '',
      '</details>',
    ];
  }
  const labelMap = { info: 'ℹ️', tip: '💡', warning: '⚠️', danger: '🚨' };
  const label = labelMap[type] || '';
  const displayTitle = title ? `${label} **${title}**` : label;
  const body = lines.join('\n');
  return [
    `<div class="${cssClass}">`,
    displayTitle ? `<p class="admonition-title">${displayTitle}</p>` : '',
    '',
    body,
    '',
    '</div>',
  ];
}

// ─── script / style stripping ────────────────────────────────────────

function stripScriptBlocks(content) {
  // Remove <script setup>...</script> and <script>...</script>
  return content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
}

function stripStyleBlocks(content) {
  return content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
}

function stripVueImports(content) {
  // Remove import ... from '...' lines (Vue-specific)
  return content
    .split('\n')
    .filter(line => !line.trim().match(/^import\s+.*\s+from\s+['"]/))
    .join('\n');
}

// ─── known Vue components → React/HTML equivalents ────────────────────

// Interactive demo components → placeholder
const DEMO_COMPONENTS = new Set([
  // All the ~200 demo components from the scan
  'ABTestingDemo', 'AIAppFlowDemo', 'AIDesignPrincipleDemo', 'AIErasComparisonDemo',
  'AINativeArchDemo', 'AIUXPatternDemo', 'AIvsTraditionalDemo', 'ASRvsTTSDemo',
  'ASTVisualizerDemo', 'AccessAnalyticsDemo', 'AccessKeyManagementDemo',
  'AccessibilityDemo', 'AdderChainDemo', 'AddressingModeDemo', 'AgentArchitectureDemo',
  'AgentChallengesDemo', 'AgentContextFlow', 'AgentFutureDemo', 'AgentLevelDemo',
  'AgentMemoryDemo', 'AgentPlanningDemo', 'AgentQuickStartDemo', 'AgentToolUseDemo',
  'AgentWorkflowDemo', 'AiEvolutionDemo', 'AiHelpDemo', 'AlertEscalationDemo',
  'AlertFlowDemo', 'AlgorithmDemo', 'AlgorithmParadigmDemo', 'AnimationLoopDemo',
  'ApiDocumentDemo', 'ApiFunctionVsHttp', 'ApiGatewayDemo', 'ApiKeyDangerDemo',
  'ApiPlayground', 'ApiRequestDemo', 'ApiResponse', 'ApiStyleCompare',
  'ApiTypesComparison', 'AppendixFlowMap', 'ArchEvolutionDemo',
  'ArchitectureComparisonDemo', 'ArchitectureDemo', 'AssetFingerprintDemo',
  'AsyncAwaitDemo', 'AsyncComparisonDemo', 'AsyncRestaurantDemo', 'AsyncTaskFlowDemo',
  'AttentionMechanismDemo', 'AudioEncodingDemo', 'AudioQuickStartDemo',
  'AudioTokenizationDemo', 'AuthBasicsDemo', 'AuthDatabaseDemo', 'AuthEvolutionDemo',
  'AuthInteractiveLoginDemo', 'AuthMiddlewareDemo', 'AuthNvsAuthZDemo',
  'AutoScalingDemo', 'AvailabilityCalculatorDemo', 'BPlusTreeDemo', 'BackendCoreDemo',
  'BackendLanguagesDemo', 'BackpressureDemo', 'BackpropagationDemo', 'BestPracticesDemo',
  'BinaryAdditionRulesDemo', 'BiosUefiInteractiveDemo', 'BlueGreenDeploymentDemo',
  'BrowserArchitectureDemo', 'BrowserDevToolsDemo', 'BrowserDevToolsLiveDemo',
  'BrowserRenderingDemo', 'BufferSwitchDemo', 'BuildPipelineDemo', 'BundlerComparisonDemo',
  'BusSystemDemo', 'CAPTheoremDemo', 'CDNAccelerationDemo', 'CISCvsRISCDemo',
  'CSRFDefenseDemo', 'CacheConsistencyDemo', 'CacheDemo', 'CacheLifecycleDemo',
  'CachePerformanceComparisonDemo', 'CachePolicyDemo', 'CacheProblemsDemo',
  'CallStackDemo', 'CanaryReleaseDemo', 'CanvasBasicsDemo', 'CapacityEstimationDemo',
  'CapacityPlanningDemo', 'CareerPathDemo', 'CdnAccelerationDemo', 'CellInspector',
  'CertificateChainDemo', 'ChainOfThoughtDemo', 'CharacterEncodingExplorer',
  'ChartTypeSelectorDemo', 'ChunkingStrategyDemo', 'CleanArchitectureDemo',
  'ClosureDemo', 'CloudServicesOverview', 'CodeOptimizationDemo', 'CodeSmellDemo',
  'CodeSplittingDemo', 'CodeToInstructionDemo', 'CommonPortsDemo',
  'CompilationPracticeDemo', 'CompileVsInterpretDemo', 'CompilerAnalogyDemo',
  'CompilerDemo', 'CompleteAdderDemo', 'CompleteAuthSystemDemo',
  'ComponentHierarchyDemo', 'ComponentTreeDemo', 'CompositeDemo',
  'ComputeInstanceDemo', 'ComputerFieldMapDemo', 'ConcurrentVsParallelDemo',
  'ConfigDriftDemo', 'ConsistencyModelsDemo', 'ContainerDockerDemo',
  'ContextCompressionDemo', 'ContextWindowVisualizer', 'ControllerDemo',
  'ControllerLayerDemo', 'CookedRawDemo', 'CoordinateSystemDemo',
  'CoroutineLightweightDemo', 'CpuArchitectureDemo', 'CrossAccountAccessDemo',
  'CssBoxModel', 'CssFlexbox', 'DOMTreeDemo', 'DashboardLayoutDemo',
  'DataAggregationDemo', 'DataFieldDesignDemo', 'DataGovernanceFrameworkDemo',
  'DataLineageDemo', 'DataModelsDemo', 'DataQualityDemo', 'DataStructureDemo',
  'DataStructureOverviewDemo', 'DataStructureSelectorDemo', 'DataTrackingDemo',
  'DataTransmissionDemo', 'DataUIGapDemo', 'DatabaseRelationDemo',
  'DecisionMatrixDemo', 'DeclarativeFormulaDemo', 'DecouplingDemo',
  'DependencyDirectionDemo', 'DependencyGraphDemo', 'DependencyTreeDemo',
  'DeployWorkflowDemo', 'DeploymentBuildDemo', 'DeploymentCicdDemo',
  'DeploymentDnsDemo', 'DeploymentHttpsDemo', 'DeploymentMonitorDemo',
  'DeploymentOverviewDemo', 'DeploymentServerDemo', 'DescriptiveStatsDemo',
  'DesignPatternCatalogDemo', 'DevServerFlowDemo', 'DevToolsApplicationDemo',
  'DevToolsConsoleDemo', 'DevToolsElementsDemo', 'DevToolsNetworkDemo',
  'DevToolsSourcesDemo', 'DeveloperSkillShiftDemo', 'DiffusionProcessDemo',
  'DiscriminativeVsGenerativeDemo', 'DistributedChallengesDemo',
  'DnsHttpsComparisonDemo', 'DnsLookupDemo', 'DnsRecordTypeDemo', 'DnsResolutionDemo',
  'DocStructureDemo', 'DockerArchitectureDemo', 'DockerLifecycleDemo',
  'DocumentTypesComparison', 'DomManipulator', 'DomOperationCostDemo',
  'DomToRenderTreeDemo', 'DomainModelDemo', 'DotEnvDemo', 'DtoFlowDemo',
  'EcommerceCacheArchitectureDemo', 'EdgeNodeDistributionDemo',
  'EmbeddingConceptDemo', 'EmbeddingDemo', 'EmbeddingPipelineDemo',
  'EmotionControlDemo', 'EnvExportDemo', 'EnvScopeDemo', 'EnvVarOverviewDemo',
  'ErrorHandlingDemo', 'ErrorResponseDesignDemo', 'EscapeParserDemo',
  'EventBusDemo', 'EventHandlingDemo', 'EventLoopDemo', 'EvolutionIntroDemo',
  'FailoverStrategyDemo', 'FeatureAlignmentDemo', 'FewShotDemo',
  'FileStorageTypeDemo', 'FileUploadFlowDemo', 'FilesystemDemo',
  'FinetuningPipelineDemo', 'FlipFlopDemo', 'FlowMatchingDemo', 'FoundationDemo',
  'FrameworkComparisonDemo', 'FrameworkMotivationDemo', 'FrameworkSpectrumDemo',
  'FrontendEvolutionDemo', 'FrontendFrameworkDemo', 'FrontendTriadDemo',
  'FullAdderDemo', 'FullProcessDemo', 'FullstackSkillDemo', 'FunctionMachineDemo',
  'FunctionalUnitDemo', 'FunnelAnalysisDemo', 'GPTEvolutionDemo',
  'GarbageCollectionDemo', 'GarbledTextDemo', 'GenericDemo', 'GenericTypeDemo',
  'GitBranchVisual', 'GitCommandCheatsheet', 'GitCommitFlow', 'GitSyncDemo',
  'GoogleOneTap', 'GoroutineGreenThreadDemo', 'GraphStructureDemo',
  'GreedyThinkingDemo', 'HalfAdderDemo', 'HashTableDemo', 'HashVsHistoryDemo',
  'HealthCheckDemo', 'HomeFeatures', 'HotReloadDemo', 'HttpExchangeDemo',
  'HttpMethodsDemo', 'HttpProtocolDemo', 'HttpsHandshakeDemo',
  'HttpsOptimizationDemo', 'IOMethodDemo', 'IaCBestPracticeDemo', 'IaCConceptDemo',
  'IaCToolComparisonDemo', 'IamRamComparisonDemo', 'IdeArchitectureDemo',
  'IdempotenceDemo', 'IdentityProviderDemo', 'ImageEncodingDemo',
  'ImageGenQuickStartDemo', 'ImageOptimizationDemo', 'ImperativeVsDeclarativeDemo',
  'IncidentCommandDemo', 'IncidentResponseDemo', 'IncidentTimelineDemo',
  'InputVisualizer', 'InstructionFormatDemo', 'InterfaceDemo',
  'InternationalizationDemo', 'IntroProblemReasonSolution', 'InvertedIndexDemo',
  'JQueryVsStateDemo', 'JSEventLoopDemo', 'JWTWorkflowDemo', 'KVCacheDemo',
  'KubernetesDemo', 'LanguageEcosystemDemo', 'LanguageMapDemo', 'LanguageScopeDemo',
  'LanguageSelectionDemo', 'LanguageTypeModelDemo', 'LatentSpaceViz',
  'LayeredArchitectureDemo', 'LayoutReflowDemo', 'LearningStrategyDemo',
  'LexerTokenDemo', 'LicenseComparisonDemo', 'LinearAttentionDemo',
  'LinearProjectionDemo', 'LinearStructuresDemo', 'LinuxCommandDemo',
  'LinuxFileSystemDemo', 'LinuxPermissionsDemo', 'LlmQuickStartDemo', 'LoRADemo',
  'LoadBalancerTypesDemo', 'LoadBalancingDemo', 'LocalhostLoopbackDemo',
  'LogicGateDemo', 'LostInMiddleDemo', 'MacroMicroTaskDemo',
  'ManualVsAutoSyncDemo', 'McpDetailedDemo', 'McpVisualDemo', 'MelSpectrogramDemo',
  'MemoryDemo', 'MemoryLeakDemo', 'MemoryPalaceActionDemo', 'MemoryPalaceDemo',
  'MfaSecurityDemo', 'MicroservicesDemo', 'MinCpuDemo', 'MoEDemo',
  'MobxReactivityDemo', 'ModelArchitectureComparisonDemo', 'ModelQuantizationDemo',
  'ModelServingDemo', 'MonitoringDashboardDemo', 'MonolithDemo',
  'MultiHeadAttentionDemo', 'NetworkArchitectureDemo', 'NetworkLayersDemo',
  'NetworkOverviewDemo', 'NeuralNetworkVisualizationDemo', 'NeuronDemo',
  'NginxArchitectureDemo', 'OSArchitectureDemo', 'OSBootInteractiveDemo',
  'ObjectStorageDemo', 'OpenSourceWorkflowDemo', 'PSWFlagDemo',
  'PackageInstallDemo', 'PackageManagerOverviewDemo', 'PaintLayerDemo',
  'ParticleSystemDemo', 'PasswordHashingDemo', 'PatchifyDemo', 'PathSearchDemo',
  'PatternPlaygroundDemo', 'PeakShavingDemo', 'PerceptronDemo', 'PerformanceDemo',
  'PerformanceMetricsDemo', 'PerformanceOverviewDemo', 'PermissionHierarchyDemo',
  'PhotoUploadJourneyDemo', 'PhysicalServerDemo', 'PipelineDemo', 'PollingDemo',
  'PortAnalogyDemo', 'PortConflictDemo', 'PortTroubleshootDemo',
  'PositionalEncodingDemo', 'PostmortemDemo', 'PowerOnDemo', 'PricingCalculator',
  'ProcessDemo', 'ProcessIsolationDemo', 'ProcessThreadCoroutineDemo',
  'ProgramLaunchDemo', 'ProgrammingLanguageMapDemo', 'ProjectorDemo',
  'PromptComparisonDemo', 'PromptDesignDemo', 'PromptQuickStartDemo',
  'PromptRobustnessDemo', 'PromptSecurityDemo', 'PromptTemplatesDemo',
  'PromptVisualizer', 'PropsFlowDemo', 'ProtocolComparisonDemo',
  'QKVMechanismDemo', 'QLabel', 'QMainWindow', 'QModbusDataUnit', 'QModbusReply',
  'QModbusTcpClient', 'QPushButton', 'QSqlDatabase', 'QTableWidget', 'QTimer',
  'QtCharts', 'QueryOptimizationDemo', 'RAGArchitectureDemo', 'RAGPipelineDemo',
  'RAGSimulationDemo', 'RAGvsFineTuningDemo', 'RNNvsTransformer',
  'RateLimitAlgorithmDemo', 'RateLimitingDemo', 'ReactivityMechanismDemo',
  'RecursiveThinkingDemo', 'RecycleScroller', 'ReduxFlowDemo', 'RefactoringDemo',
  'ReferenceDemo', 'RegexDemo', 'RegisterDemo', 'ReliabilityDemo', 'RenderingDemo',
  'RenderingPerformanceDemo', 'RenderingPipelineDemo', 'RenderingStrategyDemo',
  'RepositoryLayerDemo', 'RequestJourneyFlow', 'RequestTimeline',
  'ResponseStructureDemo', 'ResponsiveGridDemo', 'RetentionAnalysisDemo',
  'RetrievalDemo', 'ReverseProxyDemo', 'RnnVsTransformerDemo', 'RolePolicyDemo',
  'RouteMatchingDemo', 'RouterArchitectureDemo', 'RoutingModeDemo',
  'RuntimeEnvironmentDemo', 'SSEDemo', 'SSHAuthDemo', 'ScopeDemo',
  'SearchAlgorithmDemo', 'SecurityChecklistDemo', 'SelectiveContextDemo',
  'SelfAttentionDemo', 'SerializationDemo', 'ServerSecretDemo', 'ServerlessDemo',
  'ServiceLayerDemo', 'SessionCookieDemo', 'SessionPersistenceDemo',
  'SessionVsJWTDemo', 'SeverityLevelDemo', 'SignalsDemo', 'SliceRequestDemo',
  'SlidingWindowDemo', 'SortingAlgorithmDemo', 'SourceMapDemo',
  'SqlPlaygroundDemo', 'SslTerminationDemo', 'StateManagementComparisonDemo',
  'StaticVsDynamicDemo', 'StatusCodeDemo', 'StepBar', 'StorageHierarchyDemo',
  'StoragePyramidDemo', 'StorageTypeDemo', 'StrongVsWeakDemo',
  'SystemDesignStepsDemo', 'TDDCycleDemo', 'TTSPipelineDemo',
  'TaskQueueDemo', 'TaskRetryDemo', 'TaskWorkerDemo', 'TcpHandshakeDemo',
  'TechRadarDemo', 'TechStackTimelineDemo', 'TechWritingPracticeDemo',
  'TerraformWorkflowDemo', 'TestPyramidDemo', 'ThinkingModelDemo',
  'ThreadSchedulingDemo', 'TokenizationDemo', 'TokenizerToMatrix',
  'TraceVisualizationDemo', 'TrafficSchedulingDemo', 'TrainingDataDemo',
  'TrainingInferenceDemo', 'TrainingProcessDemo', 'TransactionACIDDemo',
  'TransformerArchitectureDemo', 'TransformerQuickStartDemo', 'TransistorDemo',
  'TreeShakingDemo', 'TreeStructureDemo', 'TypeAnnotationDemo', 'TypeInferenceDemo',
  'TypeInferenceFlowDemo', 'TypeSafetyPracticeDemo', 'TypeSystemDemo',
  'URLRequestDemo', 'UploadProcessDemo', 'UrlParserDemo', 'UrlToBrowserQuickStart',
  'VLMInferenceDemo', 'VariableBoxDemo', 'VectorDatabaseDemo', 'VectorIndexDemo',
  'VectorSimilarityDemo', 'VibeCodingFlowDemo', 'VirtualDomDiffDemo',
  'VirtualScrollingDemo', 'VirtualVSCodeDemo', 'VlmQuickStartDemo',
  'VoiceCloningDemo', 'VuexPiniaDemo', 'WebSecurityDemo', 'WebSocketDemo',
  'WebTechTriad', 'WhatIsDomDemo', 'WhyNoAutoSyncDemo', 'XSSDefenseDemo',
  'ZustandJotaiDemo',
  // Additional demos found during QA
  'OAuth2FlowDemo', 'OAuth2ModesDemo',
  'K8sArchitectureDemo', 'KubernetesDemo',
  'DeploymentOverviewDemo', 'DeploymentServerDemo',
  'DeploymentHttpsDemo', 'DeploymentDnsDemo',
  'DeploymentCicdDemo', 'DeploymentBuildDemo',
  'DeploymentMonitorDemo', 'DeployWorkflowDemo',
  'ContainerDockerDemo', 'DockerArchitectureDemo',
  'DockerLifecycleDemo', 'KubernetesDemo',
  'CloudServicesOverview', 'ComputeInstanceDemo',
  'PhysicalServerDemo', 'ObjectStorageDemo',
  'NetworkArchitectureDemo', 'NetworkLayersDemo',
  'NetworkOverviewDemo',
  'MicroservicesDemo', 'MonolithDemo',
  'ServerlessDemo', 'CleanArchitectureDemo',
  'LayeredArchitectureDemo', 'DomainModelDemo',
  'FrontendEvolutionDemo', 'FrontendFrameworkDemo',
  'FrontendTriadDemo', 'WebTechTriad',
  'IDEArchitectureDemo', 'DeveloperSkillShiftDemo',
  // Kubernetes / K8s components
  'K8sWorkloadsDemo', 'K8sNetworkingDemo', 'K8sStorageDemo',
  'K8sConfigDemo', 'K8sSecurityDemo', 'K8sTroubleshootDemo',
  'OV', // Some components don't have Demo suffix
]);

// Vue components that have meaningful static HTML equivalents
const COMPONENT_MAP = {
  // ── Navigation / layout components ──
  'ChapterIntroduction': (attrs, children) =>
    renderTag('div', 'tutorial-chapter-intro', attrs, children),
  'StepBar': (attrs, children) =>
    renderTag('div', 'tutorial-step-bar', attrs, children),
  'RelatedArticlesSection': (attrs, children, slug, origUrl) => {
    // Replace with a simple related-articles placeholder linking back to original
    return [
      `<div class="tutorial-related-articles">`,
      `  <p class="tutorial-related-title">📚 Related Articles</p>`,
      `  <p>View the original tutorial for full navigation: <a href="${origUrl}" target="_blank" rel="noopener noreferrer">${origUrl}</a></p>`,
      `</div>`,
    ].join('\n');
  },
  'ClientOnly': (attrs, children) => children,
  'RouterLink': (attrs, children) => {
    const to = (attrs || '').match(/to="([^"]+)"/)?.[1] || '#';
    return `<a href="${to}">${children}</a>`;
  },
  'NavCard': (attrs, children) =>
    renderTag('div', 'tutorial-nav-card', attrs, children),
  'NavGrid': (attrs, children) =>
    renderTag('div', 'tutorial-nav-grid', attrs, children),
  'Tabs': (attrs, children) =>
    renderTag('div', 'tutorial-tabs', attrs, children),
  'TabItem': (attrs, children) =>
    renderTag('div', 'tutorial-tab-item', attrs, children),
  'HomeFeatures': (attrs, children) =>
    renderTag('div', 'tutorial-home-features', attrs, children),

  // ── Terminal components ──
  'TerminalDefinition': (attrs, children) =>
    renderTag('div', 'tutorial-terminal', attrs, children),
  'TerminalGrid': (attrs, children) =>
    renderTag('div', 'tutorial-terminal-grid', attrs, children),
  'TerminalHandsOn': (attrs, children) =>
    renderTag('div', 'tutorial-terminal-hands-on', attrs, children),
  'TerminalOSDemo': (attrs, children) =>
    renderTag('div', 'tutorial-terminal-os', attrs, children),

  // ── Layout wrappers ──
  'Layout': (attrs, children) => children,
  'Main': (attrs, children) => `<main>${children}</main>`,
  'Header': (attrs, children) => `<header>${children}</header>`,
  'Page': (attrs, children) => children,
  'Enter': (attrs, children) => '',
  'Dialog': (attrs, children) =>
    renderTag('div', 'tutorial-dialog', attrs, children),

  // ── Data display ──
  'ProductCard': (attrs, children) =>
    renderTag('div', 'tutorial-product-card', attrs, children),
  'UserPanel': (attrs, children) =>
    renderTag('div', 'tutorial-user-panel', attrs, children),
  'UserStats': (attrs, children) =>
    renderTag('div', 'tutorial-user-stats', attrs, children),
  'UserTable': (attrs, children) =>
    `<table class="tutorial-user-table">${children}</table>`,
  'UserForm': (attrs, children) =>
    renderTag('div', 'tutorial-user-form', attrs, children),
  'DashboardLayoutDemo': (attrs, children) =>
    renderTag('div', 'tutorial-dashboard', attrs, children),
  'PricingCalculator': (attrs, children) =>
    renderTag('div', 'tutorial-pricing', attrs, children),

  // ── Generic data placeholders ──
  'User': (attrs, children) => children || '',
  'UserDTO': (attrs, children) => children || '',
  'PartialUser': (attrs, children) => children || '',
  'Order': (attrs, children) => children || '',
  'OrderItem': (attrs, children) => children || '',
  'ProductCard': (attrs, children) => children || '',
  'TemplateItem': (attrs, children) => children || '',
  'RegisterRequest': (attrs, children) => children || '',
  'ComponentName': (attrs, children) => children || '',

  // ── CORS / Network config components (use code blocks) ──
  'CORSConfiguration': (attrs, children) =>
    `<pre><code>${children}</code></pre>`,
  'CORSRule': (attrs, children) => children,
  'AllowedOrigin': (attrs, children) => children,
  'AllowedMethod': (attrs, children) => children,
  'AllowedHeader': (attrs, children) => children,
  'ExposeHeader': (attrs, children) => children,
  'MaxAgeSeconds': (attrs, children) => children,
  'StatusCodeCategories': (attrs, children) => children,
  'ApiResponse': (attrs, children) => children,
  'ActionResult': (attrs, children) => children,

  // ── OAuth config ──
  'OAuth': (attrs, children) => children,
  'IfModule': (attrs, children) => children,

  // ── PID ──
  'PID': (attrs, children) => children || '',

  // ── EscapeSequences (render as code) ──
  'EscapeSequences': (attrs, children) => children || '',
};

function renderTag(tag, className, attrs, children) {
  const cls = className ? ` class="${className}"` : '';
  const childContent = Array.isArray(children) ? children.join('\n') : (children || '');
  return `<${tag}${cls}>${childContent}</${tag}>`;
}

function buildOrigUrl(relPath) {
  // relPath is like: stage-1/learning-map/index.md
  // easy-vibe URL: https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/learning-map/
  const dirPart = path.dirname(relPath);
  const parts = dirPart.split(path.sep);
  // Remove 'index' if it's just a directory index
  const urlPath = parts.join('/');
  return `${ORIGIN_BASE}/${urlPath}/`;
}

// ─── Vue component self-closing tag handler ───────────────────────────

function convertVueComponents(content, relPath, origUrl) {
  // Strategy: Convert all self-closing Vue components to placeholders or HTML equivalents
  // Handle both self-closing <Foo /> and paired <Foo>...</Foo>

  let result = content;

  // 1. Handle self-closing tags: <ComponentName /> or <ComponentName attrs />
  for (const name of DEMO_COMPONENTS) {
    // Self-closing: <Name /> or <Name attr="val" />
    const selfClosing = new RegExp(
      `<${name}(\\s[^>]*)?\\s*\\/>`, 'g'
    );
    result = result.replace(selfClosing, (match, attrs) => {
      const demoName = name.replace(/Demo$/, '');
      return [
        `<div class="vue-demo-placeholder" data-demo="${demoName}">`,
        `<p>📦 Interactive Demo: <strong>${demoName}</strong></p>`,
        `<p>This interactive visualization is not available in the static version.</p>`,
        `<a href="${origUrl}" target="_blank" rel="noopener noreferrer" class="demo-original-link">🔗 View original interactive demo →</a>`,
        `</div>`,
      ].join('\n');
    });

    // Paired tags: <Name>...</Name>
    const paired = new RegExp(
      `<${name}(\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'gi'
    );
    result = result.replace(paired, (match, attrs, children) => {
      const handler = COMPONENT_MAP[name];
      if (handler) {
        return handler(attrs, children, relPath, origUrl);
      }
      const demoName = name.replace(/Demo$/, '');
      return [
        `<div class="vue-demo-placeholder" data-demo="${demoName}">`,
        `<p>📦 Interactive Demo: <strong>${demoName}</strong></p>`,
        `<p>This interactive visualization is not available in the static version.</p>`,
        `<a href="${origUrl}" target="_blank" rel="noopener noreferrer" class="demo-original-link">🔗 View original interactive demo →</a>`,
        `</div>`,
      ].join('\n');
    });
  }

  // 2. Handle known components in COMPONENT_MAP that aren't in DEMO_COMPONENTS
  for (const [name, handler] of Object.entries(COMPONENT_MAP)) {
    const selfClosing = new RegExp(
      `<${name}(\\s[^>]*)?\\s*\\/>`, 'g'
    );
    result = result.replace(selfClosing, (match, attrs) => {
      return handler(attrs || '', '', relPath, origUrl);
    });

    const paired = new RegExp(
      `<${name}(\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'gi'
    );
    result = result.replace(paired, (match, attrs, children) => {
      return handler(attrs || '', children || '', relPath, origUrl);
    });
  }

  // 3. Generic fallback: any remaining self-closing <XxxYyy ... /> tags → placeholder
  //    Matches PascalCase component names with at least one uppercase letter (allowing digits)
  result = result.replace(/<([A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)+)\s*\/>/g, (match, name) => {
    // Skip HTML void elements and known non-components
    if (/^(Br|Hr|Img|Input|Link|Meta|Source|Area|Base|Col|Embed|Track|Wbr)$/.test(name)) {
      return match;
    }
    const demoName = name.replace(/Demo$/, '');
    return [
      `<div class="vue-demo-placeholder" data-demo="${demoName}">`,
      `<p>📦 Interactive Demo: <strong>${demoName}</strong></p>`,
      `<p>This interactive visualization is not available in the static version.</p>`,
      `<a href="${origUrl}" target="_blank" rel="noopener noreferrer" class="demo-original-link">🔗 View original interactive demo →</a>`,
      `</div>`,
    ].join('\n');
  });

  return result;
}

// ─── Element Plus component conversion ────────────────────────────────

function convertElementPlus(content) {
  let result = content;

  // <el-card ...> → <div class="tutorial-card">
  result = result.replace(/<el-card([^>]*)>/gi, '<div class="tutorial-card">');
  result = result.replace(/<\/el-card>/gi, '</div>');

  // <el-tag type="success"> → <span class="chip chip-green">
  result = result.replace(
    /<el-tag\s+type="([^"]+)"[^>]*>/gi,
    '<span class="chip chip-$1">'
  );
  result = result.replace(/<el-tag[^>]*>/gi, '<span class="chip">');
  result = result.replace(/<\/el-tag>/gi, '</span>');

  // <el-tabs> → <div class="tutorial-tabs">
  result = result.replace(/<el-tabs[^>]*>/gi, '<div class="tutorial-tabs">');
  result = result.replace(/<\/el-tabs>/gi, '</div>');

  // <el-tab-pane label="..."> → <div class="tutorial-tab-pane" data-label="...">
  result = result.replace(
    /<el-tab-pane[^>]*label="([^"]*)"[^>]*>/gi,
    '<div class="tutorial-tab-pane" data-label="$1">'
  );
  result = result.replace(/<\/el-tab-pane>/gi, '</div>');

  // <el-progress :percentage="N"> → <div class="tutorial-progress" style="width:N%">
  result = result.replace(
    /<el-progress[^>]*:percentage="([^"]*)"[^>]*\/>/gi,
    '<div class="tutorial-progress"><div class="tutorial-progress-bar" style="width:$1%"></div></div>'
  );
  result = result.replace(
    /<el-progress[^>]*percentage="([^"]*)"[^>]*\/>/gi,
    '<div class="tutorial-progress"><div class="tutorial-progress-bar" style="width:$1%"></div></div>'
  );
  result = result.replace(/<el-progress[^>]*\/>/gi, '<div class="tutorial-progress"></div>');

  // <el-row> → <div class="flex flex-wrap">
  result = result.replace(/<el-row[^>]*>/gi, '<div class="flex flex-wrap">');
  result = result.replace(/<\/el-row>/gi, '</div>');

  // <el-col :span="N"> → <div style="flex: N/24">
  result = result.replace(
    /<el-col[^>]*:span="([^"]*)"[^>]*>/gi,
    '<div style="flex: $1">'
  );
  result = result.replace(/<el-col[^>]*>/gi, '<div>');
  result = result.replace(/<\/el-col>/gi, '</div>');

  // <el-select v-model="x" ...> → <span class="tutorial-el-select">
  result = result.replace(/<el-select[^>]*>/gi, '<span class="tutorial-el-select">');
  result = result.replace(/<\/el-select>/gi, '</span>');
  // <el-option ...> → <span class="tutorial-el-option">
  result = result.replace(/<el-option[^>]*\/>/gi, '<span class="tutorial-el-option"></span>');
  result = result.replace(/<el-option[^>]*>/gi, '<span class="tutorial-el-option">');
  result = result.replace(/<\/el-option>/gi, '</span>');
  // <el-button ...> → <span class="tutorial-el-button">
  result = result.replace(/<el-button[^>]*>/gi, '<span class="tutorial-el-button">');
  result = result.replace(/<\/el-button>/gi, '</span>');
  // <el-collapse> → <div class="tutorial-collapse">
  result = result.replace(/<el-collapse[^>]*>/gi, '<div class="tutorial-collapse">');
  result = result.replace(/<\/el-collapse>/gi, '</div>');
  // <el-collapse-item title="..."> → <details class="tutorial-collapse-item">
  result = result.replace(
    /<el-collapse-item[^>]*title="([^"]*)"[^>]*>/gi,
    '<details class="tutorial-collapse-item"><summary>$1</summary>'
  );
  result = result.replace(/<\/el-collapse-item>/gi, '</details>');

  // Strip remaining Vue directives (v-model, @click, etc.) from HTML tags
  result = result.replace(/\s+v-model="[^"]*"/gi, '');
  result = result.replace(/\s+@click="[^"]*"/gi, '');
  result = result.replace(/\s+:value="[^"]*"/gi, '');
  result = result.replace(/\s+v-if="[^"]*"/gi, '');
  result = result.replace(/\s+v-for="[^"]*"/gi, '');
  result = result.replace(/\s+:key="[^"]*"/gi, '');
  result = result.replace(/\s+placeholder="[^"]*"/gi, (m) => m); // keep placeholder
  // Remove style attributes — they cause React errors in MDX
  result = result.replace(/\s+style="[^"]*"/gi, '');

  return result;
}

// ─── image path rewriting ─────────────────────────────────────────────

function rewriteImagePaths(content, relPath) {
  let result = content;

  // Handle Markdown image syntax: ![alt](images/foo.png)
  const dirPart = path.dirname(relPath);
  const prefix = `/tutorial/images/${dirPart}`;

  // Replace relative image paths
  result = result.replace(
    /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
    `![$1](${prefix}/images/$2)`
  );

  // Replace relative image paths in <img> tags
  result = result.replace(
    /<img\s+([^>]*?)src="images\/([^"]+)"([^>]*)>/g,
    `<img $1src="${prefix}/images/$2"$3>`
  );

  return result;
}

// ─── cross-reference link fixing ─────────────────────────────────────

function fixCrossReferences(content, relPath) {
  let result = content;

  // Fix relative markdown links: [text](../other-topic/) → absolute /tutorial/ paths
  // This is tricky; we convert known patterns
  result = result.replace(
    /\[([^\]]*)\]\((\/[^\)]+\/)\)/g,
    (match, text, url) => {
      // Absolute /easy-vibe/zh-cn/... paths → /tutorial/...
      if (url.startsWith('/easy-vibe/zh-cn/')) {
        const newUrl = url.replace('/easy-vibe/zh-cn/', '/tutorial/');
        return `[${text}](${newUrl})`;
      }
      return match;
    }
  );

  return result;
}

// ─── add license footer ───────────────────────────────────────────────

function addLicenseFooter(content) {
  return content + '\n\n---\n\n' + [
    `<div class="tutorial-attribution">`,
    `<p>📄 This content is adapted from the <a href="${ATTRIBUTION_URL}" target="_blank" rel="noopener noreferrer">Easy-Vibe project</a> by <strong>${ATTRIBUTION_NAME}</strong>, licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">${CC_LICENSE}</a>.</p>`,
    `<p>You are free to share and adapt this material with attribution, for non-commercial purposes, under the same license.</p>`,
    `</div>`,
  ].join('\n');
}

// ─── frontmatter builder ──────────────────────────────────────────────

function buildFrontmatter(origData, relPath, stage, section) {
  const dirParts = path.dirname(relPath).split(path.sep);
  const fileName = path.basename(relPath, path.extname(relPath));

  // Build tags
  const tags = ['tutorial'];
  if (stage === 1) tags.push('stage-1', 'beginner');
  else if (stage === 2) tags.push('stage-2', 'intermediate');
  else if (stage === 3) tags.push('stage-3', 'advanced');
  else if (stage === 4) tags.push('vibe-stories');
  else tags.push('appendix');

  if (section) tags.push(section);

  // Build original URL
  let origUrl = buildOrigUrl(relPath);

  // Default title from filename if missing
  const title = origData.title || fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const description = origData.description || '';

  return {
    title,
    description,
    date: fileAge(path.join(SRC, relPath)),
    tags,
    published: true,
    stage,
    original_url: origUrl,
    lang: 'zh-CN',
    ...(section ? { section } : {}),
  };
}

function formatFrontmatter(data) {
  const lines = ['---'];
  lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  lines.push(`date: "${data.date}"`);
  if (data.description) {
    const desc = data.description.replace(/"/g, '\\"').replace(/\n/g, ' ');
    lines.push(`description: "${desc}"`);
  }
  lines.push(`tags: ${JSON.stringify(data.tags)}`);
  lines.push(`published: ${data.published}`);
  lines.push(`stage: ${data.stage}`);
  lines.push(`lang: ${data.lang}`);
  if (data.section) lines.push(`section: "${data.section}"`);
  if (data.original_url) lines.push(`original_url: "${data.original_url}"`);
  lines.push('---');
  return lines.join('\n');
}

// ─── main conversion ──────────────────────────────────────────────────

function convertFile(relPath) {
  const srcPath = path.join(SRC, relPath);
  let raw;
  try {
    raw = fs.readFileSync(srcPath, 'utf-8');
  } catch (e) {
    console.error(`  ❌ Failed to read: ${relPath}`);
    return null;
  }

  // Parse frontmatter
  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    console.error(`  ⚠️  Failed to parse frontmatter: ${relPath}`);
    parsed = { data: {}, content: raw };
  }

  let content = parsed.content;
  const origData = parsed.data;

  // Detect stage and section
  const stage = detectStage(relPath);
  const section = detectSection(relPath);
  const origUrl = buildOrigUrl(relPath);

  // ── Apply transformations in order ──

  // 1. Strip Vue script blocks
  content = stripScriptBlocks(content);

  // 2. Strip Vue import statements (may remain outside script blocks)
  content = stripVueImports(content);

  // 3. Strip style blocks
  content = stripStyleBlocks(content);

  // 4. Convert admonitions (:::) — do this BEFORE component conversion
  //    because admonitions may contain components
  content = convertAdmonitions(content);

  // 5. Convert known Vue components
  content = convertVueComponents(content, relPath, origUrl);

  // 6. Convert Element Plus components
  content = convertElementPlus(content);

  // 7. Rewrite image paths
  content = rewriteImagePaths(content, relPath);

  // 8. Fix cross-references
  content = fixCrossReferences(content, relPath);

  // 9. Escape template/expression braces that aren't valid JSX
  //    Handle {{ }} first (Vue template syntax)
  content = content.replace(/\{\{\s*[^}]+\s*\}\}/g, (match) => {
    return `\`${match}\``;
  });
  //    Handle {Chinese text} or {non-JS identifier patterns} outside code blocks
  //    These get parsed as JSX expressions by MDX but are template placeholders
  content = content.replace(/\{([^}]*[一-鿿][^}]*)\}/g, (match, inner) => {
    // Only escape if it looks like placeholder text, not code
    return `\`${match}\``;
  });

  // 10. Remove HTML comments (not valid in MDX)
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  // 10b. Escape MDX-unsafe < patterns (not HTML tags)
  // < followed by digit: comparison operators <10, <1ms
  content = content.replace(/<(\d)/g, '&lt;$1');
  // < followed by Chinese/Unicode: <图像>
  content = content.replace(/<([^\x00-\x7F])/g, '&lt;$1');
  // </ followed by non-letter: </something> in text
  content = content.replace(/<\/([^a-zA-Z])/g, '&lt;/$1');
  // <% or <# or <= in text (not HTML)
  content = content.replace(/<%/g, '&lt;%');
  content = content.replace(/<#/g, '&lt;#');
  // < followed by whitespace (invalid tag)
  content = content.replace(/<(\s)/g, '&lt;$1');

  // 11. Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  // 12. Add license footer to content
  content = addLicenseFooter(content);

  // Build new frontmatter
  const fm = buildFrontmatter(origData, relPath, stage, section);
  const fmStr = formatFrontmatter(fm);

  // Assemble output
  const output = fmStr + '\n\n' + content.trimStart();

  // Determine output path
  const ext = path.extname(relPath);
  const mdxRelPath = relPath.replace(ext, '.mdx');
  const outPath = path.join(DST_CONTENT, mdxRelPath);
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, output, 'utf-8');

  return { relPath, mdxRelPath, stage, section, origUrl, title: fm.title };
}

function copyImages(relPath) {
  const dirPart = path.dirname(relPath);
  const srcImg = path.join(SRC, dirPart, 'images');
  const dstImg = path.join(DST_IMAGES, dirPart, 'images');

  if (fs.existsSync(srcImg)) {
    return copyDir(srcImg, dstImg);
  }
  return 0;
}

// ─── runner ───────────────────────────────────────────────────────────

function walkDir(dir, basePath = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = basePath ? path.join(basePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      // Skip public/ and non-content dirs inside source
      if (entry.name === 'public' || entry.name === 'node_modules') continue;
      results.push(...walkDir(full, rel));
    } else if (entry.name.endsWith('.md')) {
      results.push(rel);
    }
  }

  return results;
}

console.log('🔍 Scanning source files...');
const files = walkDir(SRC);

console.log(`📄 Found ${files.length} markdown files\n`);

// Group by stage for reporting
const stats = { stage1: 0, stage2: 0, stage3: 0, stories: 0, appendix: 0, guide: 0 };
const errors = [];
let totalImages = 0;

for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const stage = detectStage(f);

  if (stage === 1) stats.stage1++;
  else if (stage === 2) stats.stage2++;
  else if (stage === 3) stats.stage3++;
  else if (stage === 4) stats.stories++;
  else if (f.startsWith('appendix')) stats.appendix++;
  else stats.guide++;

  try {
    const result = convertFile(f);
    if (result) {
      const imgs = copyImages(f);
      totalImages += imgs;

      if ((i + 1) % 20 === 0 || i === files.length - 1) {
        process.stdout.write(`\r  Converting... ${i + 1}/${files.length}`);
      }
    } else {
      errors.push(f);
    }
  } catch (e) {
    console.error(`\n  ❌ Error converting: ${f}`);
    console.error(`     ${e.message}`);
    errors.push(f);
  }
}

console.log('\n');
console.log('✅ Conversion complete!\n');
console.log('📊 Stats:');
console.log(`   Stage 1:       ${stats.stage1} files`);
console.log(`   Stage 2:       ${stats.stage2} files`);
console.log(`   Stage 3:       ${stats.stage3} files`);
console.log(`   Vibe Stories:  ${stats.stories} files`);
console.log(`   Appendix:      ${stats.appendix} files`);
console.log(`   Guide/Other:   ${stats.guide} files`);
console.log(`   Total:         ${files.length} files`);
console.log(`   Images copied: ${totalImages}`);
if (errors.length > 0) {
  console.log(`\n⚠️  ${errors.length} files with errors:`);
  errors.forEach(f => console.log(`   - ${f}`));
}

console.log(`\n📁 Output: ${DST_CONTENT}`);
console.log(`🖼️  Images: ${DST_IMAGES}`);
