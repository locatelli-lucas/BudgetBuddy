package com.budgetbuddy.project.services;
import org.springframework.stereotype.Service;

import okhttp3.*;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import com.jayway.jsonpath.JsonPath;

@Service
public class OllamaService {

    public String generateAnswer(String prompt) {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();

        String json = "{\"model\": \"llama3:latest\", \"prompt\": \"" + prompt + "\", \"stream\": false}";
        RequestBody requestBody = RequestBody.create(json, MediaType.get("application/json; charset=utf-8"));

        Request request = new Request.Builder()
                .url("http://localhost:11434/api/generate")
                .post(requestBody)
                .build();

        try(Response response = client.newCall(request).execute()) {
            if(!response.isSuccessful()) throw new RuntimeException("Response generation failed");

            assert response.body() != null;
            String responseBody = response.body().string();
            String parsedResponse = JsonPath.read(responseBody, "$.response");

            System.out.println(parsedResponse);
            return parsedResponse;
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
