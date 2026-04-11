package com.agenda.backend;

import com.agenda.backend.model.Role;
import com.agenda.backend.model.User;
import com.agenda.backend.service.JwtService;
import com.agenda.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private UserService userService;

	@MockBean
	private JwtService jwtService;

	@Test
	void contextLoads() {
	}

	@Test
	void loginEndpointReturnsTokenOnPost() throws Exception {
		User user = new User();
		user.setId(1L);
		user.setEmail("test@example.com");
		user.setPassword("encoded-password");
		user.setRole(Role.PATIENT);

		when(userService.login(any())).thenReturn(user);
		when(jwtService.generateToken(user)).thenReturn("fake.jwt.token");

		mockMvc.perform(post("/api/auth/login")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"email\":\"test@example.com\",\"password\":\"password123\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").value("fake.jwt.token"));
	}

}
