const form = document.getElementById('registro-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        nombres: formData.get('nombres'),
        apellidos: formData.get('apellidos'),
        telefono: formData.get('telefono'),
        correo: formData.get('correo'),
        contrasena: formData.get('contrasena'),
    };

    try {
        const response = await fetch('/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            form.reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
        console.error(error);
    }
});