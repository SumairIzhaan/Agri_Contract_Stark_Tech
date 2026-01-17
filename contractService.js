export const downloadContract = async (contractDetails) => {
    try {
        const response = await fetch('http://localhost:5000/api/contract/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contractDetails),
        });

        if (!response.ok) {
            throw new Error('Failed to generate contract');
        }

        // Convert to Blob
        const blob = await response.blob();

        // Create Download Link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contract_${contractDetails.deal.contractId || Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return true;
    } catch (error) {
        console.error("Contract Download Error:", error);
        throw error;
    }
};
