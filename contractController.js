const PDFDocument = require("pdfkit")

const generateContract = (req, res) => {
    console.log("CONTRACT GEN REQUEST:", new Date().toISOString())
    console.log("Body:", JSON.stringify(req.body, null, 2))

    try {
        const { farmer, buyer, crop, deal } = req.body

        if (!farmer || !buyer || !crop || !deal) {
            return res.status(400).send("Missing required contract details")
        }

        const totalAmount = Number(deal.totalAmount)
        const advanceAmount = totalAmount * 0.2

        const doc = new PDFDocument({ margin: 50 })
        let buffers = []

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers)
            const filename = `Contract_${deal.contractId || Date.now()}.pdf`

            res.setHeader("Content-Type", "application/pdf")
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            )
            res.setHeader("Content-Length", pdfData.length)

            res.status(200).send(pdfData)
        })

        doc.on("error", err => {
            console.error("PDF STREAM ERROR:", err)
            if (!res.headersSent) {
                res.status(500).send("Error generating PDF")
            }
        })

        const colors = {
            primary: "#166534",
            dark: "#1f2937",
            light: "#6b7280",
            accent: "#f3f4f6"
        }

        const drawSectionHeader = (text, y) => {
            doc.fillColor(colors.accent)
            doc.rect(50, y - 5, 500, 25).fill()
            doc.fillColor(colors.primary)
            doc.fontSize(14).font("Helvetica-Bold").text(text, 60, y)
            doc.fillColor(colors.dark)
            return y + 30
        }

        const drawField = (label, value, x, y) => {
            doc.fontSize(10).font("Helvetica-Bold").text(label + ":", x, y)
            doc.font("Helvetica").text(value || "-", x + 120, y)
        }

        // TITLE
        doc.fontSize(24)
            .fillColor(colors.primary)
            .font("Helvetica-Bold")
            .text("Digital Contract Farming Agreement", { align: "center" })

        doc.moveDown(0.5)
        doc.fontSize(10)
            .fillColor(colors.light)
            .font("Helvetica")
            .text("Generated via Digital Contract Farming Platform", {
                align: "center"
            })

        doc.moveDown(2)
        let yPos = doc.y

        // OVERVIEW
        yPos = drawSectionHeader("1. Contract Overview", yPos)
        drawField("Contract ID", deal.contractId || `CNT-${Date.now()}`, 60, yPos)
        drawField("Creation Date", new Date().toLocaleString(), 320, yPos)
        yPos += 25

        // FARMER
        yPos = drawSectionHeader("2. Farmer Details", yPos)
        drawField("Name", farmer.name, 60, yPos)
        drawField("Mobile", farmer.phone, 320, yPos)
        yPos += 15
        drawField(
            "Location",
            `${farmer.village || ""}, ${farmer.district || ""}, ${farmer.state || ""}`,
            60,
            yPos
        )
        yPos += 25

        // BUYER
        yPos = drawSectionHeader("3. Buyer Details", yPos)
        drawField("Name", buyer.name, 60, yPos)
        drawField("Mobile", buyer.phone, 320, yPos)
        yPos += 15
        drawField(
            "Location",
            `${buyer.village || ""}, ${buyer.district || ""}, ${buyer.state || ""}`,
            60,
            yPos
        )
        yPos += 25

        // DEAL
        yPos = drawSectionHeader("4. Crop & Deal Details", yPos)
        drawField("Crop", crop.name, 60, yPos)
        drawField("Quantity", `${deal.quantity} Quintal`, 320, yPos)
        yPos += 15
        drawField("Price", `₹${deal.pricePerQuintal}/Qtl`, 60, yPos)
        yPos += 20

        doc.strokeColor(colors.primary)
        doc.rect(60, yPos, 480, 30).stroke()
        doc.fontSize(12)
            .font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text(`Total Contract Value: ₹${totalAmount}`, 80, yPos + 8)
        doc.fillColor(colors.dark)

        yPos += 45

        // ADVANCE
        yPos = drawSectionHeader("5. Advance Payment", yPos)
        drawField("Advance (20%)", `₹${advanceAmount}`, 60, yPos)
        drawField("Mode", "Online / UPI", 320, yPos)
        yPos += 25

        // DELIVERY
        yPos = drawSectionHeader("6. Delivery Terms", yPos)
        drawField("Date", deal.deliveryDate || "Within 7 days", 60, yPos)
        drawField(
            "Location",
            deal.deliveryLocation || "Nearest Mandi",
            320,
            yPos
        )
        yPos += 25

        // SIGNATURES
        doc.moveDown(4)
        yPos = doc.y

        doc.rect(50, yPos, 220, 80).stroke()
        doc.rect(330, yPos, 220, 80).stroke()

        doc.fontSize(10).font("Helvetica-Bold").text("FARMER", 70, yPos + 10)
        doc.fontSize(12).fillColor("green").text("✓ DIGITALLY SIGNED", 70, yPos + 30)
        doc.fillColor(colors.dark)

        doc.fontSize(10).font("Helvetica-Bold").text("BUYER", 350, yPos + 10)
        doc.fontSize(12).fillColor("green").text("✓ DIGITALLY SIGNED", 350, yPos + 30)
        doc.fillColor(colors.dark)

        doc.moveDown(6)
        doc.fontSize(8)
            .fillColor(colors.light)
            .text(
                "This is a system-generated digital contract. Physical signature not required.",
                { align: "center" }
            )

        doc.end()
    } catch (error) {
        console.error("PDF GENERATION ERROR:", error)
        if (!res.headersSent) {
            res.status(500).send("Error generating contract PDF")
        }
    }
}

module.exports = { generateContract }
