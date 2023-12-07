package tests

import (
	"net/http"
	"net/http/httptest"
	"os"
	"real-time-forum/lib"
	"testing"
)

func TestLoadEnv(t *testing.T) {
	err := lib.LoadEnv(".env")
	if err != nil {
		t.Errorf("Error loading .env file: %v", err)
	}

	expectedValues := map[string]string{
		"KEY1": "VALUE1",
		"KEY2": "VALUE2",
		// Add more key-value pairs
	}

	for key, expectedValue := range expectedValues {
		actualValue := os.Getenv(key)
		if actualValue != expectedValue {
			t.Errorf("Expected %s=%s, but got %s", key, expectedValue, actualValue)
		}
	}
}

func TestValidateRequest(t *testing.T) {
	req, _ := http.NewRequest("GET", "/path/to/page", nil)
	res := httptest.NewRecorder()

	valid := lib.ValidateRequest(req, res, "/path/to/page", "GET")
	if !valid {
		t.Errorf("Expected request to be valid, but it wasn't")
	}
}
