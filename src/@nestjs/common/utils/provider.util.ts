import { Provider } from "@nestjs/common";
import {
  ClassProvider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
} from "@nestjs/common";

function isClassProvider(provider: Provider): provider is ClassProvider {
  return provider && (provider as ClassProvider).useClass !== undefined;
}

function isValueProvider(provider: Provider): provider is ValueProvider {
  return provider && (provider as ValueProvider).useValue !== undefined;
}

function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return provider && (provider as FactoryProvider).useFactory !== undefined;
}

function isExistingProvider(provider: Provider): provider is ExistingProvider {
  return provider && (provider as any).useExisting !== undefined;
}

export {
  isClassProvider,
  isValueProvider,
  isFactoryProvider,
  isExistingProvider,
};
