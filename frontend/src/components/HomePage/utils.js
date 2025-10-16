import axios from 'axios';

export const generateTest = async (requestData, navigate, setNotification, setIsGenerating) => {
    setIsGenerating(true);
    try {
        const response = await axios.post('http://localhost:8080/api/llm/generate-test', requestData);

        navigate('/results', {
            state: {
                generatedTest: response.data,
                inputData: {
                    contractCode: requestData.solidityCode,
                }
            }
        });

        setNotification({
            open: true,
            message: 'Test generated successfully!',
            severity: 'success'
        });

    } catch (error) {
        console.error('Error generating test:', error);
        setNotification({
            open: true,
            message: error.response?.data || 'Failed to generate test',
            severity: 'error'
        });
    } finally {
        setIsGenerating(false);
    }
};