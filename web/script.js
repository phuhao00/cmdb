function showDemo() {
    alert('CMDB Demo:\n\nSample Assets:\n- Server-001 (Production Web Server)\n- DB-Primary (Main Database Server)\n- LB-001 (Load Balancer)\n- Switch-Core-01 (Network Switch)\n\nRecent Changes:\n- Server-001: Memory upgraded to 32GB\n- DB-Primary: Backup schedule updated\n- LB-001: SSL certificate renewed');
}

function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.querySelector('input[type="text"]').value;
    const email = event.target.querySelector('input[type="email"]').value;
    alert(`Thank you, ${name}! Your message has been received. We'll contact you at ${email} soon.`);
    event.target.reset();
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});