/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.samples.petclinic.system;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.ModelAndView;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for {@link ResourceNotFoundExceptionHandler}
 */
class ResourceNotFoundExceptionHandlerTests {

	@Test
	void testHandlerReturnsNotFoundView() {
		ResourceNotFoundExceptionHandler handler = new ResourceNotFoundExceptionHandler();
		ResourceNotFoundException exception = new ResourceNotFoundException("Test resource not found");

		ModelAndView mav = handler.handleResourceNotFoundException(exception);

		assertThat(mav.getViewName()).isEqualTo("notFound");
	}

	@Test
	void testHandlerSetsUserFriendlyMessage() {
		ResourceNotFoundExceptionHandler handler = new ResourceNotFoundExceptionHandler();
		ResourceNotFoundException exception = new ResourceNotFoundException("Test resource not found");

		ModelAndView mav = handler.handleResourceNotFoundException(exception);

		assertThat(mav.getModel()).containsKey("message");
		assertThat(mav.getModel().get("message")).asString().doesNotContain("Test resource not found");
		assertThat(mav.getModel().get("message")).asString().contains("not found");
	}

	@Test
	void testHandlerDoesNotExposeStackTraces() {
		ResourceNotFoundExceptionHandler handler = new ResourceNotFoundExceptionHandler();
		ResourceNotFoundException exception = new ResourceNotFoundException("Test resource not found");

		ModelAndView mav = handler.handleResourceNotFoundException(exception);

		assertThat(mav.getModel()).doesNotContainKey("trace");
		assertThat(mav.getModel()).doesNotContainKey("exception");
		assertThat(mav.getModel()).doesNotContainKey("error");
	}

}
