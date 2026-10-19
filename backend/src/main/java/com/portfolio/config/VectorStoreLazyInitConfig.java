package com.portfolio.config;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Qdrant VectorStore 빈을 지연 초기화 대상으로 전환한다.
 *
 * QdrantVectorStoreAutoConfiguration이 등록하는 "vectorStore" 빈은 평범한
 * 싱글톤이라 애플리케이션 컨텍스트가 뜰 때(preInstantiateSingletons) 바로
 * 생성되고, 그 과정에서 afterPropertiesSet()이 Qdrant에 동기로 접속을
 * 시도한다. Qdrant 클러스터가 죽어 있으면 이 시점에 예외가 터져서 서버
 * 전체가 기동하지 못한다.
 *
 * 이 BeanFactoryPostProcessor는 "vectorStore" 빈 정의에 lazy-init 플래그를
 * 걸어, 실제로 그 빈을 사용하는 요청이 들어오기 전까지 생성(및 Qdrant 접속)을
 * 미룬다. Qdrant가 내려가 있어도 서버 자체는 정상 기동하고, Qdrant를 쓰지
 * 않는 엔드포인트는 영향을 받지 않는다. (VectorStore를 주입받는 쪽에도
 * @Lazy를 붙여 실제 사용 시점까지 프록시로 참조만 들고 있게 해뒀다.)
 */
@Configuration
public class VectorStoreLazyInitConfig {

    @Bean
    static BeanFactoryPostProcessor vectorStoreLazyInitPostProcessor() {
        return VectorStoreLazyInitConfig::markVectorStoreLazy;
    }

    private static void markVectorStoreLazy(ConfigurableListableBeanFactory beanFactory) {
        if (beanFactory.containsBeanDefinition("vectorStore")) {
            BeanDefinition definition = beanFactory.getBeanDefinition("vectorStore");
            definition.setLazyInit(true);
        }
    }
}
