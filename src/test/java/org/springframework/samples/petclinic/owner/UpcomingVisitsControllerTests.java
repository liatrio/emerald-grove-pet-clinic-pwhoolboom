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

package org.springframework.samples.petclinic.owner;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledInNativeImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Test class for {@link UpcomingVisitsController}
 */
@WebMvcTest(UpcomingVisitsController.class)
@DisabledInNativeImage
@DisabledInAotMode
class UpcomingVisitsControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private VisitRepository visitRepository;

	private UpcomingVisit upcomingVisit() {
		return new UpcomingVisit(1, "George Franklin", "Samantha", LocalDate.now().plusDays(1), "rabies shot");
	}

	@Test
	void testShowUpcomingVisitsDefault() throws Exception {
		given(this.visitRepository.findUpcomingVisits(any(), any())).willReturn(List.of(upcomingVisit()));

		mockMvc.perform(get("/visits/upcoming"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("upcomingVisits"));
	}

	@Test
	void testShowUpcomingVisitsWithDaysParam() throws Exception {
		given(this.visitRepository.findUpcomingVisits(any(), any())).willReturn(List.of(upcomingVisit()));

		mockMvc.perform(get("/visits/upcoming").param("days", "14"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("upcomingVisits"));
	}

	@Test
	void testShowUpcomingVisitsInvalidDaysZero() throws Exception {
		mockMvc.perform(get("/visits/upcoming").param("days", "0"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("errorMessage"))
			.andExpect(model().attributeDoesNotExist("upcomingVisits"));
	}

	@Test
	void testShowUpcomingVisitsInvalidDays366() throws Exception {
		mockMvc.perform(get("/visits/upcoming").param("days", "366"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("errorMessage"))
			.andExpect(model().attributeDoesNotExist("upcomingVisits"));
	}

	@Test
	void testShowUpcomingVisitsEmptyState() throws Exception {
		given(this.visitRepository.findUpcomingVisits(any(), any())).willReturn(List.of());

		mockMvc.perform(get("/visits/upcoming"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("upcomingVisits"))
			.andExpect(model().attributeDoesNotExist("errorMessage"));
	}

}
