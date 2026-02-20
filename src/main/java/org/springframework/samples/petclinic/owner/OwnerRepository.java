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

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository class for <code>Owner</code> domain objects. All method names are compliant
 * with Spring Data naming conventions so this interface can easily be extended for Spring
 * Data. See:
 * https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-methods.query-creation
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy
 * @author Wick Dynex
 */
public interface OwnerRepository extends JpaRepository<Owner, Integer> {

	/**
	 * Retrieve {@link Owner}s from the data store by last name, returning all owners
	 * whose last name <i>starts</i> with the given name.
	 * @param lastName Value to search for
	 * @return a Collection of matching {@link Owner}s (or an empty Collection if none
	 * found)
	 */
	Page<Owner> findByLastNameStartingWith(String lastName, Pageable pageable);

	/**
	 * Retrieve an {@link Owner} from the data store by id.
	 * <p>
	 * This method returns an {@link Optional} containing the {@link Owner} if found. If
	 * no {@link Owner} is found with the provided id, it will return an empty
	 * {@link Optional}.
	 * </p>
	 * @param id the id to search for
	 * @return an {@link Optional} containing the {@link Owner} if found, or an empty
	 * {@link Optional} if not found.
	 * @throws IllegalArgumentException if the id is null (assuming null is not a valid
	 * input for id)
	 */
	Optional<Owner> findById(Integer id);

	/**
	 * Check whether an {@link Owner} with the given first name, last name, and telephone
	 * already exists in the data store (case-insensitive name comparison).
	 * @param firstName the first name to match (case-insensitive)
	 * @param lastName the last name to match (case-insensitive)
	 * @param telephone the telephone number to match
	 * @return an {@link Optional} containing the matching {@link Owner} if found, or an
	 * empty {@link Optional} if not found.
	 */
	Optional<Owner> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(String firstName, String lastName,
			String telephone);

	/**
	 * Retrieve {@link Owner}s from the data store matching any combination of last name
	 * (case-insensitive prefix), telephone (exact), and city (case-insensitive prefix). A
	 * {@code null} parameter means "no filter applied" for that field.
	 * @param lastName case-insensitive prefix to match, or {@code null} to skip
	 * @param telephone exact telephone to match, or {@code null} to skip
	 * @param city case-insensitive prefix to match, or {@code null} to skip
	 * @param pageable pagination settings
	 * @return a {@link Page} of matching {@link Owner}s
	 */
	@Query("SELECT o FROM Owner o WHERE "
			+ "(:lastName IS NULL OR LOWER(o.lastName) LIKE LOWER(CONCAT(:lastName, '%'))) AND "
			+ "(:telephone IS NULL OR o.telephone = :telephone) AND "
			+ "(:city IS NULL OR LOWER(o.city) LIKE LOWER(CONCAT(:city, '%')))")
	Page<Owner> findByFilters(@Param("lastName") String lastName, @Param("telephone") String telephone,
			@Param("city") String city, Pageable pageable);

}
