import React, { createContext, useContext, useMemo } from 'react';
import { AuthRepository, CourseRepository } from '../domain/repositories';
import { SecureTokenStore, TokenStore } from '../data/auth/tokenStore';
import { AppAuthRepository } from '../data/repositories/authRepository';
import { AppCourseRepository } from '../data/repositories/courseRepository';
import { SqliteCourseLocalDataSource } from '../data/local/courseLocalDataSource';
import { FakeCourseRemoteDataSource } from '../data/remote/fakeCourseRemoteDataSource';
import { Clock, defaultClock } from './config';

export interface AppContainer {
  courseRepository: CourseRepository;
  authRepository: AuthRepository;
  tokenStore: TokenStore;
  clock: Clock;
}

export function createDefaultContainer(clock: Clock = defaultClock): AppContainer {
  const tokenStore = new SecureTokenStore();
  const authRepository = new AppAuthRepository(tokenStore, clock);
  const localDataSource = new SqliteCourseLocalDataSource();
  const remoteDataSource = new FakeCourseRemoteDataSource(clock);
  const courseRepository = new AppCourseRepository(localDataSource, remoteDataSource);

  return {
    courseRepository,
    authRepository,
    tokenStore,
    clock,
  };
}

let activeContainer: AppContainer | null = null;

export function getAppContainer(): AppContainer {
  if (!activeContainer) {
    activeContainer = createDefaultContainer();
  }
  return activeContainer;
}

export function setAppContainer(container: AppContainer | null): void {
  activeContainer = container;
}

const ContainerContext = createContext<AppContainer | null>(null);

export interface ContainerProviderProps {
  container?: AppContainer;
  children: React.ReactNode;
}

export const ContainerProvider: React.FC<ContainerProviderProps> = ({
  container,
  children,
}) => {
  const resolvedContainer = useMemo(
    () => container ?? getAppContainer(),
    [container],
  );

  return (
    <ContainerContext.Provider value={resolvedContainer}>
      {children}
    </ContainerContext.Provider>
  );
};

export function useContainer(): AppContainer {
  const context = useContext(ContainerContext);
  return context ?? getAppContainer();
}
