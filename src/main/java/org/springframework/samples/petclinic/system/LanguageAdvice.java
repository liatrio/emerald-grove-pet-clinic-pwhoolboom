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

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/**
 * Adds {@code currentUrl} (the current request path plus any non-language query
 * parameters) to every model so that Thymeleaf templates can build language-switching
 * URLs that stay on the current page and preserve filters like {@code page},
 * {@code specialty}, {@code lastName}, and {@code days}.
 *
 * <p>
 * Any existing {@code lang=} parameter is stripped from the query string before appending
 * so that the template's {@code (lang=xx)} expression does not produce duplicate
 * parameters.
 */
@ControllerAdvice
class LanguageAdvice {

	@ModelAttribute("currentUrl")
	String currentUrl(HttpServletRequest request) {
		String uri = request.getRequestURI();
		String queryString = request.getQueryString();
		if (queryString == null) {
			return uri;
		}
		String filtered = Arrays.stream(queryString.split("&"))
			.filter(p -> !p.startsWith("lang="))
			.collect(Collectors.joining("&"));
		return filtered.isEmpty() ? uri : uri + "?" + filtered;
	}

}
