import "./Footer.scss";

const Footer = () => {
	return (
		<footer className="footer">
			<p className="footer__author">
				&copy; {new Date().getFullYear()} Sedmník
			</p>
			<p className="footer__author">
				Created by{" "}
				<a href="https://www.heeeyooo.studio/" target="_blank">
					heeeyooo studio
				</a>
			</p>
		</footer>
	);
};

export default Footer;
